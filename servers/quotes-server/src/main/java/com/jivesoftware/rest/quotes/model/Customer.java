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
package com.jivesoftware.rest.quotes.model;

/**
 * <p>Customer model interface for quotes system.</p>
 */
public interface Customer {

    public long getID();
    public void setID(long id);

    public String getAccountNumber();
    public void setAccountNumber(String accountNumber);

    // ID of the account manager for this customer
    public long getAccountUserID();
    public void setAccountUserID(long accountUserID);

    public String getName();
    public void setName(String name);

}
