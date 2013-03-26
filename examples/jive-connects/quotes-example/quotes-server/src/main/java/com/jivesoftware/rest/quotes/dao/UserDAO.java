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
package com.jivesoftware.rest.quotes.dao;

import com.jivesoftware.rest.quotes.model.User;

import java.util.List;

/**
 * <p>User DAO interface for quotes system.</p>
 */
public interface UserDAO {

    public void delete(User user) throws IllegalArgumentException;

    public List<User> find();

    public User find(String username);

    public User get(long userID);

    public void insert(User user) throws IllegalArgumentException;

    public void reset();

    public void update(User user) throws IllegalArgumentException;

}
