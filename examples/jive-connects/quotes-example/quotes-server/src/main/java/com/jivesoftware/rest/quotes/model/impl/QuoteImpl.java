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
package com.jivesoftware.rest.quotes.model.impl;

import com.jivesoftware.rest.quotes.model.Line;
import com.jivesoftware.rest.quotes.model.Quote;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * <p>Quote model implementation for quotes system.</p>
 */
public class QuoteImpl implements Quote {

    public QuoteImpl() {}

    public QuoteImpl(long id, long customerID, String description, long dueDate,
                     String quoteNumber, long quoteUserID, String status,
                     String summary, BigDecimal totalPrice) {
        this.id = id;
        this.customerID = customerID;
        this.description = description;
        this.dueDate = dueDate;
        this.quoteNumber = quoteNumber;
        this.quoteUserID = quoteUserID;
        this.status = status;
        this.summary = summary;
        this.totalPrice = totalPrice;
    }

    private long id = -1;
    private long customerID = -1;
    private String description;
    private long dueDate = (new Date()).getTime();
    private List<Line> lines;
    private String quoteNumber;
    private long quoteUserID;
    private String status;
    private String summary;
    private BigDecimal totalPrice = new BigDecimal("0");

    public long getID() {
        return id;
    }

    public void setID(long id) {
        this.id = id;
    }

    public long getCustomerID() {
        return customerID;
    }

    public void setCustomerID(long customerID) {
        this.customerID = customerID;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getDueDate() {
        return dueDate;
    }

    public void setDueDate(long dueDate) {
        this.dueDate = dueDate;
    }

    public List<Line> getLines() {
        if (lines == null) {
            lines = new ArrayList<Line>();
        }
        return lines;
    }

    public void setLines(List<Line> lines) {
        this.lines = lines;
    }

    public String getQuoteNumber() {
        return quoteNumber;
    }

    public void setQuoteNumber(String quoteNumber) {
        this.quoteNumber = quoteNumber;
    }

    public long getQuoteUserID() {
        return quoteUserID;
    }

    public void setQuoteUserID(long quoteUserID) {
        this.quoteUserID = quoteUserID;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

}
