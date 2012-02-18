/**
  Copyright 2012 Jive Software

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
package com.jivesoftware.rest.quotes.dao.impl;

import com.jivesoftware.rest.quotes.dao.UserDAO;
import com.jivesoftware.rest.quotes.model.User;
import com.jivesoftware.rest.quotes.model.impl.UserImpl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


/**
 * <p>User DAO implementation for quotes system.</p>
 */
public class UserDAOImpl implements UserDAO {

    @Override
    public synchronized void delete(User user) throws IllegalArgumentException {
        User previous = users.get(user.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing user " + user.getID());
        }
        users.remove(user.getID());
    }

    @Override
    public synchronized List<User> find() {
        List<User> results = new ArrayList<User>();
        for (User user : users.values()) {
            results.add(user);
        }
        return results;
    }

    @Override
    public synchronized User find(String username) {
        for (User user : users.values()) {
            if (username.equals(user.getUsername())) {
                return user;
            }
        }
        return null;
    }

    @Override
    public synchronized User get(long userID) {
        return users.get(userID);
    }

    public void init() {
        reset();
    }

    @Override
    public synchronized void insert(User user) throws IllegalArgumentException {
        long highest = highest();
        user.setID(highest + 1);
        users.put(user.getID(), user);
    }

    @Override
    public synchronized void reset() {
        users.clear();
        User user;
        user = new UserImpl(-1, "John",  "Salesman",   "sales1");                            insert(user);
        user = new UserImpl(-1, "Jane",  "Saleswoman", "sales2");                            insert(user);
    }

    @Override
    public synchronized void update(User user) throws IllegalArgumentException {
        User previous = users.get(user.getID());
        if (previous == null) {
            throw new IllegalArgumentException("Missing user " + user.getID());
        }
        users.put(user.getID(), user);
    }

    private long highest() {
        long highest = 0;
        for (Long key : users.keySet()) {
            long value = key.longValue();
            if (value > highest) {
                highest = value;
            }
        }
        return highest;
    }

    private Map<Long,User> users = new HashMap<Long,User>();

}
