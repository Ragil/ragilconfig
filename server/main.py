import logging
from flask import Flask, request, json
from flask.ext.cors import cross_origin
from google.appengine.ext import ndb
from functools import wraps


app = Flask(__name__)

def jsonify(func):
  """Convert response into json object."""
  @wraps(func)
  def inner(*args, **kwargs):
    response = func(args, kwargs)
    return json.jsonify(response)
  return inner


class Config(ndb.Model):
  """Store config for a given namespace"""
  username = ndb.StringProperty()
  password = ndb.StringProperty()
  props = ndb.JsonProperty()

  def toJson():
    return {
      'username' : username,
      'password' : password,
      'props' : props
    }


@app.route('/admin/config', methods=['POST'])
@cross_origin()
@jsonify
def put(*args, **kwargs):
  """Update config.

  namespace : config namespace
  props : json props
  """
  json = request.get_json()
  if not json:
    return { 'error' : 'missing request data' }

  required_keys = ['namespace', 'username', 'password', 'props']
  for rk in required_keys:
    if rk not in json:
      return { 'error' : '%s is required' % rk }

  config = Config(
      id = json['namespace'],
      username = json['username'],
      password = json['password'],
      props = json['props'])

  config.put()
  return config.props

@app.route('/admin/config', methods=['GET'])
@cross_origin()
@jsonify
def list(*args, **kwargs):
  """Return all configs."""
  configs = Config.query().get()
  return {
    'configs' : [c.toJson() for c in configs]
  }


@app.route('/config', methods=['GET'])
@cross_origin()
@jsonify
def get(*args, **kwargs):
  """Fetch config for a given namespace.

  namespace : config namespace
  auth : username and password required to fetch the config
  """
  namespace = request.args.get('namespace')
  if not namespace:
    return { 'error' : 'namespace is required' }

  auth = request.authorization
  if not auth:
    return { 'error' : 'auth is required' }

  config = Config.get_by_id(namespace)
  if not config:
    return { 'error' : 'config not found for ' + namespace }

  if config.username != auth.username and config.password != auth.password:
    return { 'error' : 'unauthorized' }

  return config.props
