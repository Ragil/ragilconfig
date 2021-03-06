import logging
from flask import Flask, request, json, abort
from flask.ext.cors import cross_origin
from google.appengine.ext import ndb
from functools import wraps


app = Flask(__name__)

def jsonify(func):
  """Convert response into json object."""
  @wraps(func)
  def inner(*args, **kwargs):
    response = func(*args, **kwargs)
    return json.jsonify(response)
  return inner


class Config(ndb.Model):
  """Store config for a given namespace"""
  username = ndb.StringProperty()
  password = ndb.StringProperty()
  props = ndb.JsonProperty()

  def toJson(self):
    return {
      'namespace' : self.key.id(),
      'username' : self.username,
      'password' : self.password,
      'props' : self.props
    }


def generic_error_handler(error):
  if 'description' not in error:
    return error
  return json.jsonify(error.description), error.code

for error in range(400, 420) + range(500,506):
    app.error_handler_spec[None][error] = generic_error_handler


@app.route('/admin/config', methods=['POST'])
@cross_origin()
@jsonify
def put():
  """Update config.

  namespace : config namespace
  props : json props
  """
  data = request.get_json(force=True)
  if not data:
    abort(400, { 'error' : 'missing request data' })

  required_keys = ['namespace', 'username', 'password', 'props']
  for rk in required_keys:
    if rk not in data:
      abort(400, { 'error' : '%s is required' % rk })

  config = Config(
      id = data['namespace'],
      username = data['username'],
      password = data['password'],
      props = data['props'])

  config.put()
  return config.toJson()

@app.route('/admin/config', methods=['GET'])
@cross_origin()
@jsonify
def list():
  """Return all configs."""
  configs = Config.query().fetch()
  return {
    'configs' : [c.toJson() for c in configs] if configs else []
  }


def _getConfig(namespace):
  """Return config for a given namespace"""
  if not namespace:
    abort(400, { 'error' : 'namespace is required' })

  config = Config.get_by_id(namespace)
  if not config:
    abort(404, { 'error' : 'config not found' })

  return config


@app.route('/admin/config/<namespace>', methods=['DELETE'])
@cross_origin()
@jsonify
def deleteAsAdmin(namespace):
  config = _getConfig(namespace)
  config.key.delete()
  return config.toJson()


@app.route('/admin/config/<namespace>', methods=['GET'])
@cross_origin()
@jsonify
def getAsAdmin(namespace):
  """Return for a given config.

  namespace : config namespace
  """
  return _getConfig(namespace).toJson()


@app.route('/config/<namespace>', methods=['GET'])
@cross_origin()
@jsonify
def get(namespace):
  """Fetch config for a given namespace.

  namespace : config namespace
  auth : username and password required to fetch the config
  """
  auth = request.authorization
  if not auth:
    abort(400, { 'error' : 'auth is required' })

  config = _getConfig(namespace)

  if config.username != auth.username or config.password != auth.password:
    abort(403, { 'error' : 'unauthorized' })

  return config.props
