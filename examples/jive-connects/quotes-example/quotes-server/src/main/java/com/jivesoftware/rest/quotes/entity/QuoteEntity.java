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
package com.jivesoftware.rest.quotes.entity;

import com.jivesoftware.rest.quotes.model.Line;
import com.jivesoftware.rest.quotes.model.Quote;
import com.jivesoftware.rest.quotes.model.impl.QuoteImpl;

import javax.xml.bind.annotation.XmlRootElement;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;

/**
 * <p>Quote model representation for quotes system.</p>
 */
@XmlRootElement(name = "quote")
public class QuoteEntity {

    private static final DateFormat DUE_DATE_FORMAT =
            new SimpleDateFormat("MM/dd/yyyy");

    private static final NumberFormat TOTAL_PRICE_FORMAT =
            new DecimalFormat("###,000");

    public QuoteEntity() {
        this.quote = new QuoteImpl();
    }

    public QuoteEntity(Quote quote) {
        this.quote = quote;
    }

    private CustomerEntity customer;
    private Quote quote;
    private UserEntity quoteUser;

    public long getID() {
        return quote.getID();
    }

    public void setID(long id) {
        quote.setID(id);
    }

    public CustomerEntity getCustomer() {
        return this.customer;
    }

    public void setCustomer(CustomerEntity customer) {
        this.customer = customer;
    }

    public String getDescription() {
        return quote.getDescription();
    }

    public void setDescription(String description) {
        quote.setDescription(description);
    }

    public long getDueDate() {
        return quote.getDueDate();
    }

    public void setDueDate(long dueDate) {
        quote.setDueDate(dueDate);
    }

    public String getDueDateString() {
        synchronized (DUE_DATE_FORMAT) {
            return DUE_DATE_FORMAT.format(getDueDate());
        }
    }

    public void setDueDateString(String dueDateString) {} // No-op

    public List<LineEntity> getLines() {
        List<LineEntity> results = new ArrayList<LineEntity>();
        for (Line line : quote.getLines()) {
            results.add(new LineEntity(line));
        }
        return results;
    }

    public void setLines(List<LineEntity> lines) {
        // No-op for JAXB
    }

    public String getQuoteNumber() {
        return quote.getQuoteNumber();
    }

    public void setQuoteNumber(String quoteNumber) {
        quote.setQuoteNumber(quoteNumber);
    }

    public UserEntity getQuoteUser() {
        return this.quoteUser;
    }

    public void setQuoteUser(UserEntity quoteUser) {
        this.quoteUser = quoteUser;
    }

    public String getStatus() {
        return quote.getStatus();
    }

    public void setStatus(String status) {
        quote.setStatus(status);
    }

    public String getSummary() {
        return quote.getSummary();
    }

    public void setSummary(String summary) {
        quote.setSummary(summary);
    }

    public BigDecimal getTotalPrice() {
        return quote.getTotalPrice();
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        quote.setTotalPrice(totalPrice);
    }

    public String getTotalPriceString() {
        synchronized (TOTAL_PRICE_FORMAT) {
            return TOTAL_PRICE_FORMAT.format(getTotalPrice());
        }
    }

    public void setTotalPriceString(String totalPriceString) {} // no-op

}
