#   Copyright 2013 Jive Software
# 
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
# 
#      http://www.apache.org/licenses/LICENSE-2.0
# 
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

#
# DB Abstraction Layer
#

#
# Require Libraries
#
$         = require 'jquery'
simpledb  = require 'simpledb'
util      = require './util.js'

#
# AWS Credentials
#
awsCredentials =
  keyid: "<key>"
  secret: "<secret>"

# Default environment
_env = 'development'

# Simple DB value escape function
e = (str) -> str.replace(/'/g, "''")

# Return a date N days ago
daysAgo = (n=0) ->
  date = new Date()
  date.setDate date.getDate() - parseInt(n, 10)
  date

#
# SimpleDB Connection
#
sdb = new simpledb.SimpleDB(awsCredentials)

DB =

  env: (val) ->
    if val
      _env = val
    else
      (if _env then _env else 'development')

  ## Helper Methods

  # Standard Callback that will log any simple db errors and call passed callback
  standardCallback: (callback) ->
    (error, result, meta) ->
      if error
        console.log "  SimpleDB error: ", error
      callback error, result, meta

  init: ->
    DB.PropType.initDomain()

  padNumber: (number, length) ->
    str = '' + (number || 0)
    while str.length < length
      str = '0' + str
    str

  # Run query and log select statement
  select: (query, callback) ->
    console.log "  SimpleDB Query   " + query
    sdb.select query, DB.standardCallback(callback)

  ## Models

  PropType:
    domainName: () ->
      "#{DB.env()}PropTypes"

    fixtures: ->
      require('./defproptypes.js').propTypes

    initDomain: ->
      sdb.domainMetadata DB.PropType.domainName(), (error, resource, metadata) ->
        if error
          console.log "Creating " + DB.PropType.domainName() + " domain..."
          sdb.createDomain DB.PropType.domainName(), (error) ->
            if error
              console.log "Error Creating Domain: " + JSON.stringify(error)
            else
              DB.PropType.populateDomain()

    populateDomain: ->
      sdb.batchPutItem DB.PropType.domainName(), DB.PropType.fixtures(), (error, result, meta) ->
        if error
          console.log "Error creating batch put items for default props: " + JSON.stringify(error) + " Meta: " + JSON.stringify(meta)
        else
          console.log "Adding a default prop: " + JSON.stringify(result) + " " + JSON.stringify(meta)

    resetDomain: ->
      sdb.deleteDomain DB.PropType.domainName(), (error, result, meta) ->
        if error
          console.log "Could not delete default props domain: ", error
        else
          DB.PropType.initDomain()

    findAllByLevel: (level, callback) ->
      level       = DB.padNumber(level, 4)
      query       = "SELECT * FROM `#{DB.PropType.domainName()}`"
      query      += " WHERE level <= '#{e(level)}'" if level
      DB.select query, callback

    findByName: (name, callback) ->
      sdb.getItem DB.PropType.domainName(), name, DB.standardCallback(callback)

  Prop:
    domainName: (jiveInstanceId) ->
      "#{DB.env()}PropsJiveInstance-#{jiveInstanceId}"

    findAll: (options, callback) ->
      filters = []

      filters.push "user_id     = '#{if options.user_id then e(options.user_id) else options.ownerId}'"
      filters.push "giver_id    = '#{e(options.giver_id)}'"  if options.giver_id
      filters.push "prop_type   = '#{e(options.prop_type)}'" if options.prop_type
      filters.push "message     = '#{e(options.message)}'"   if options.message
      filters.push "stream_entry_url     = '#{e(options.stream_entry_url)}'"   if options.stream_entry_url
      filters.push "created_at != ''"

      query  = "SELECT * FROM `#{DB.Prop.domainName(options.jiveInstanceId)}` "
      query += "WHERE #{filters.join(' AND ')} "
      query += "ORDER BY created_at desc"
      DB.select query, callback

    find: (jiveInstanceId, id, callback) ->
      sdb.getItem DB.Prop.domainName(jiveInstanceId), id, DB.standardCallback(callback)

    count: (jiveInstanceId, options={}, callback) ->
      filters = []

      filters.push "user_id     = '#{e(options.user_id)}'"   if options.user_id
      filters.push "giver_id    = '#{e(options.giver_id)}'"  if options.giver_id
      filters.push "prop_type   = '#{e(options.prop_type)}'" if options.prop_type and options.prop_type != '@all'
      filters.push "created_at >= '#{daysAgo(options.days_ago).toISOString()}'" if options.days_ago

      query  = "SELECT count(*) FROM `#{DB.Prop.domainName(jiveInstanceId)}` "
      query += "WHERE #{filters.join(' AND ')}" if filters.length > 0
      DB.select query, callback

    stream: (jiveInstanceId, options={}, callback) ->
      query  = "SELECT * FROM `#{DB.Prop.domainName(jiveInstanceId)}` "
      query += "WHERE created_at != '' AND created_at >= '#{daysAgo(14).toISOString()}' "
      query += "ORDER BY created_at desc"
      DB.select query, callback

    initObj: (attrs={}) ->
      obj = {}
      obj.user_id       = attrs.user_id       || '' # who received the prop
      obj.giver_id      = attrs.giver_id      || '' # who gave the prop
      obj.prop_type     = attrs.prop_type     || '' # the type of prop given (Beer/Genius/CrushedIt/etc)
      obj.message       = attrs.message       || '' # the message the giver said when giving the prop
      obj.stream_entry_url = attrs.stream_entry_url || '' # the stream entry associated for this activity
      obj.original_id   = attrs.original_id   || '' # if this is a pile on of an existing prop, the id of the original prop
      obj.content_type  = attrs.content_type  || '' # if associated with a piece of jive content, it's type
      obj.content_id    = attrs.content_id    || '' # if associated with a piece of jive content, it's id
      obj.content_link  = attrs.content_link  || '' # if associated with a piece of jive content, it's link
      obj.content_title = attrs.content_title || '' # if associated with a piece of jive content, it's title
      obj.created_at    = (new Date()).toISOString() # ISO 8601 date format including fractional seconds
      obj

    validate: (jiveInstanceId, attrs={}, callback) ->
      errors = []

      # Check for blank fields
      fields = 'user_id giver_id prop_type message'.split ' '
      for field in fields
        do (field) ->
          errors.push [field, 'cannot be blank'] if not attrs[field]

      # Check for duplicates
      DB.Prop.findAll $.extend(attrs, {jiveInstanceId: jiveInstanceId}), (error, result, meta) ->
        if error && error.Code is 'NoSuchDomain'
          domainName = DB.Prop.domainName(jiveInstanceId)
          sdb.createDomain domainName, (error, result, meta) ->
            if error
              console.log "Error creating domain: ", error
              callback [error]
            else
              DB.Prop.validate jiveInstanceId, attrs, callback
        else if error
          callback [error]
        else if result.length > 0
          errors.push ["prop", "already exists"]
          callback errors
        else
          callback errors

    create: (jiveInstanceId, attrs, callback) ->
      DB.Prop.validate jiveInstanceId, attrs, (errors) ->

        if errors.length > 0
          callback errors, null, null
        else
          domainName = DB.Prop.domainName(jiveInstanceId)
          guid = attrs['$ItemName'] or util.guid()

          # Setup prop object
          prop = DB.Prop.initObj(attrs)

          sdb.putItem domainName, guid, prop, (error, result, meta) ->
            if error && error.Code is 'NoSuchDomain'
              sdb.createDomain domainName, (error, result, meta) ->
                if error
                  console.log "Error creating domain: ", error
                else
                  DB.Prop.create jiveInstanceId, attrs, callback
            else if error
              console.log "Error creating item: ", error
            else
              sdb.getItem domainName, guid, DB.standardCallback(callback)

exports.env              = DB.env
exports.standardCallback = DB.standardCallback
exports.init             = DB.init
exports.PropType         = DB.PropType
exports.Prop             = DB.Prop
