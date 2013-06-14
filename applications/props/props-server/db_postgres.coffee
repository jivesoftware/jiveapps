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
pg        = require 'pg'
log       = require 'util'

util      = require './util.js'
require './init.js'

# Default environment
_env = 'development'

# Return a date N days ago
daysAgo = (n=0) ->
  date = new Date()
  date.setDate date.getDate() - parseInt(n, 10)
  date

# string escape function
e = (str) -> str.replace(/'/g, "''")

DB =
  env: (val) ->
    if val
      _env = val
    else
      (if _env then _env else 'development')

# Standard Callback that will log any db errors and call passed callback, then call done() to return the postgres client to the pool.
  standardCallback: (callback, query, done) ->
    (error, result) ->
      if error
        log.debug "  Postgres error on query #{query}: ", JSON.stringify error
        callback error, null
      done();
      callback error, result

  padNumber: (number, length) ->
    str = '' + (number || 0)
    while str.length < length
      str = '0' + str
    str

# Pull a postgres client from the client pool, and use it to run the query.
  query: (query, callback) ->
    log.log "  Postgres Query   " + query
    pg.connect(exports.DB_LOCATION, (err, client, done) ->
      if err
        log.debug("connect error: "+JSON.stringify(err))
      else
        client.query(query, DB.standardCallback(callback, query, done))
    );

## Models
  Instances:
    tableName: () ->
      "#{DB.env()}jiveinstances"

    register: (jiveInstanceid, callback) ->
      queryStr = "INSERT INTO #{DB.Instances.tableName()} values('#{jiveInstanceid}');"
      DB.query(queryStr, (err, res) ->
        if err && err.code != '23505'
          log.debug("error registering new instance: #{JSON.stringify err}")
          callback(err)
        else
          if err && err.code == '23505'
            log.log("jive instance is already registered. resetting...")
            DB.PropType.resetTable(jiveInstanceid)
          else
            log.log("registered new jive instance into props app")
            DB.PropType.populateTable(jiveInstanceid)
          callback()
      );

  PropType:
    #since prop types can be customized, each jive instanance has its own prop types table.
    tableName: () ->
      "#{DB.env()}proptypes"

    fixtures: () ->
      require('./defproptypes.js').propTypes

    #fill the prop types table with the default prop types
    populateTable: (jiveInstanceid) ->
      for type in DB.PropType.fixtures()
        DB.PropType.insert jiveInstanceid, type, (err, result) ->
          if (err)
            log.debug "Error initializing data into PropTypes table: "+ JSON.stringify err
          else
            log.log "Adding default prop type: " + JSON.stringify result

    resetTable: (jiveInstanceid) ->
      DB.PropType.delete jiveInstanceid, null, (err, res) ->
        if err
          log.debug "error resetting table: could not delete existing prop types: #{JSON.stringify err}"
        else
          DB.PropType.populateTable(jiveInstanceid)

    propTypeObjFromRow: (row) ->
      {
        $ItemName:row.id,
        title: row.title,
        definition: row.definition,
        image_url: row.image_url,
        reflection_image_url: row.image_url,
        level: row.level
      }

    findAllByLevel: (jiveInstanceid, level, callback) ->
      level = DB.padNumber(level, 4)
      query = "SELECT * FROM "+DB.PropType.tableName()+" WHERE jiveInstanceId='#{jiveInstanceid}'"
      query += " AND level <= '#{e(level)}';" if level
      DB.query query, (err, result) ->
        if err
          callback(err,result)
        else
          types = []
          for row in result.rows
            types.push DB.PropType.propTypeObjFromRow row
          callback(err, types)

    # find a prop type by its title. Calculates the hash (based on title and instance id) and finds that entryh in the DB.
    findByName: (jiveInstanceid, name, callback) ->
      id = util.stringHash(name+jiveInstanceid)
      DB.PropType.findById(jiveInstanceid, id, callback)

    findById: (jiveInstanceid, id, callback) ->
      DB.query("SELECT * FROM "+DB.PropType.tableName()+" WHERE jiveInstanceId='#{jiveInstanceid}' AND id='"+id+"';", (err, result) ->
        if (err)
          log.debug("findbyname error: "+JSON.stringify err);
          callback(err)
        else
          if(result.rows[0])
            callback(null, DB.PropType.propTypeObjFromRow(result.rows[0]));
          else
            callback(null, null)
      )

    modify: (jiveInstanceid, body, callback) ->
      DB.PropType.delete jiveInstanceid, util.stringHash(body.title+jiveInstanceid), (err, result) ->
        if err
          callback err
        else
          DB.PropType.insert jiveInstanceid, body, (err1, res) ->
            if err1
              callback err1
            else
              callback null, DB.PropType.propTypeObjFromRow res.rows[0]

    insert: (jiveInstanceid, body, callback) ->
      queryStr = "INSERT INTO "+DB.PropType.tableName()+" values ";
      queryStr += "('"+util.stringHash(body.title+jiveInstanceid)+"','"+e(body.title)+"','"+e(body.definition)+"','"+e(body.level)+"','"+e(body.image_url)+"','"+e(jiveInstanceid)+"')"
      queryStr += " RETURNING (id,title,definition,level,image_url,jiveInstanceId);";
      DB.query queryStr, callback

    delete: (jiveInstanceid, id, callback) ->
      queryStr = "DELETE FROM #{DB.Prop.tableName()} WHERE jiveInstanceId='#{jiveInstanceid}' " #first delete props of the prop type (or all props if this is a reset).
      if id
        queryStr += " AND prop_type='#{id}'"
      queryStr += ";"
      DB.query queryStr,(err, res) ->
        if err
          log.debug("Error deleting props of deleted prop types: #{err}")
          callback(err, res)
        else
          queryStr = "DELETE FROM "+DB.PropType.tableName()
          queryStr += " WHERE jiveInstanceId='#{jiveInstanceid}'"
          if id
            queryStr += " AND id='#{id}'"
          queryStr += ";"
          DB.query queryStr, (err1, res1) ->
            if err1
              callback err1, res1
            else
              callback null, res1

  Prop:
    tableName: () ->
      "#{DB.env()}props"

    contentTableName: () ->
      "#{DB.env()}linkedcontent"

    sanitizeOutputCallback: (err, res, callback) ->
      if res.rows
        for row in res.rows
          for k,v of row
            if $.trim(v)=='NULL'
              row[k]=''
        callback err, res.rows
      else
        callback err, res

    findAll: (options, callback) ->
      filters = []
      filters.push "user_id     = '#{if options.user_id then options.user_id else options.ownerId}'"
      filters.push "giver_id    = '#{options.giver_id}'"  if options.giver_id
      filters.push "prop_type   = '#{options.prop_type}'" if options.prop_type
      filters.push "message     = '#{e(options.message)}'"   if options.message
      filters.push "stream_entry_url     = '#{e(options.stream_entry_url)}'"   if options.stream_entry_url
      filters.push "created_at IS NOT NULL"

      query  = "SELECT * FROM #{DB.Prop.tableName()} "
      query += "WHERE jiveInstanceId='#{options.jiveInstanceId}' AND #{filters.join(' AND ')} "
      query += "ORDER BY created_at desc"
      DB.query query, (err, res) ->
        DB.Prop.sanitizeOutputCallback(err, res, callback)

    #find prop by id
    find: (jiveInstanceId, id, callback) ->
      queryStr = "SELECT * FROM "+DB.Prop.tableName()+" WHERE jiveInstanceId='#{jiveInstanceId}' AND name='"+id+"';"
      DB.query queryStr, (err, res) ->
        DB.Prop.sanitizeOutputCallback(err, res, callback)

    count: (jiveInstanceId, options={}, callback) ->
      filters = []

      filters.push "user_id     = '#{e(options.user_id)}'"   if options.user_id
      filters.push "giver_id    = '#{e(options.giver_id)}'"  if options.giver_id
      filters.push "prop_type   = '#{e(options.prop_type)}'" if options.prop_type and options.prop_type != '@all'
      filters.push "created_at >= '#{daysAgo(options.days_ago).toISOString()}'" if options.days_ago

      query  = "SELECT count(*) FROM #{DB.Prop.tableName()} "
      query += "WHERE jiveInstanceId='#{jiveInstanceId}' "
      query += "AND #{filters.join(' AND ')}" if filters.length > 0
      DB.query query, (err, res) ->
        callback(err, res)

    #get props for the last 14 days
    stream: (jiveInstanceId, options={}, callback) ->
      query  = "SELECT * FROM #{DB.Prop.tableName()} "
      query += "WHERE jiveInstanceId='#{jiveInstanceId}' AND created_at IS NOT NULL AND created_at >= '#{daysAgo(14).toISOString()}' "
      query += "ORDER BY created_at desc"
      DB.query query, (err, res) ->
        DB.Prop.sanitizeOutputCallback(err, res, callback)

    validate: (jiveInstanceId, attrs={}, callback) ->
      errors = []

      # Check for blank fields
      fields = 'user_id giver_id prop_type message'.split ' '
      for field in fields
        do (field) ->
          errors.push [field, 'cannot be blank'] if not attrs[field]

      # Check for duplicates
      DB.Prop.findAll $.extend(attrs, {jiveInstanceId: jiveInstanceId}), (error, result) ->
        if error
          callback [error]
        else if result.length > 0
          errors.push ["prop", "already exists"]
          callback errors
        else
          callback errors

    initObj: (attrs={}) ->
      obj = {}
      content_obj={}
      obj.user_id       = attrs.user_id       || 'NULL' # who received the prop
      obj.giver_id      = attrs.giver_id      || 'NULL' # who gave the prop
      obj.prop_type     = attrs.prop_type     || 'NULL' # the type of prop given (Beer/Genius/CrushedIt/etc)
      obj.message       = attrs.message       || 'NULL' # the message the giver said when giving the prop
      obj.stream_entry_url = attrs.stream_entry_url || 'NULL' # the stream entry associated for this activity
      obj.original_id   = attrs.original_id   || 'NULL' # if this is a pile on of an existing prop, the id of the original prop
      obj.content_id    = attrs.content_id    || 'NULL' # if associated with a piece of jive content, it's id
      obj.created_at    = 'now' # postgres will interpret this with its timestamp data type

      content_obj.content_id    = attrs.content_id    || 'NULL' # if associated with a piece of jive content, it's id
      content_obj.content_type  = attrs.content_type  || 'NULL' # if associated with a piece of jive content, it's type
      content_obj.content_link  = attrs.content_link  || 'NULL' # if associated with a piece of jive content, it's link
      content_obj.content_title = attrs.content_title || 'NULL' # if associated with a piece of jive content, it's title
      return [obj, content_obj]

    createProp: (jiveInstanceId, attrs, callback) ->
      DB.Prop.validate jiveInstanceId, attrs, (errors) ->
        if errors.length > 0
          callback errors, null
        else
          id = attrs['$ItemName'] or util.guid()
          obj = DB.Prop.initObj(attrs)
          makeProp = (hasContent) ->
            prop = obj[0]
            queryStr = "INSERT INTO #{DB.Prop.tableName()} "
            queryStr += " VALUES ('#{e(id)}','#{prop.user_id}','#{prop.giver_id}','#{prop.prop_type}','#{e(prop.message)}','#{e(prop.stream_entry_url)}','#{e(prop.original_id)}','#{e(jiveInstanceId)}','#{prop.created_at}',";
            if hasContent
              queryStr += "'#{e(prop.content_id)}');";
            else
              queryStr += "NULL);";
            DB.query queryStr, (err, res) ->
              if err
                log.debug("Error creating item: ", JSON.stringify err)
                callback err, null
              else
                log.log("Put new prop into DB: ", JSON.stringify res)
                callback null, res
          linkedcontent = obj[1]
          if linkedcontent.content_id != 'NULL'
            queryStr = "INSERT INTO #{DB.Prop.contentTableName()} "
            queryStr = " VALUES ('#{e(linkedcontent.content_id)}','#{e(linkedcontent.content_type)}','#{e(linkedcontent.content_link)}','#{e(linkedcontent.content_title)}','#{jiveInstanceId}'"
            DB.query queryStr, (err,res) ->
              if err
                log.debug "error putting linked content"
              else
                makeProp(true)
          else
            makeProp(false)

exports.env              = DB.env
exports.standardCallback = DB.standardCallback
exports.init             = DB.init
exports.PropType         = DB.PropType
exports.Prop             = DB.Prop
exports.Instances        = DB.Instances