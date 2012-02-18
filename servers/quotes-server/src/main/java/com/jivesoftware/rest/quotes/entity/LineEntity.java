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
import com.jivesoftware.rest.quotes.model.impl.LineImpl;

import javax.xml.bind.annotation.XmlRootElement;
import java.math.BigDecimal;

/**
 * <p>Quote line model representation for quotes system.</p>
 */
@XmlRootElement(name = "line")
public class LineEntity {

    public LineEntity() {
        this.line = new LineImpl();
    }

    public LineEntity(Line line) {
        this.line = line;
    }

    private Line line;

    public long getID() {
        return line.getID();
    }

    public void setID(long id) {
        line.setID(id);
    }

    public String getDescription() {
        return line.getDescription();
    }

    public void setDescription(String description) {
        line.setDescription(description);
    }

    public int getLineNumber() {
        return line.getLineNumber();
    }

    public void setLineNumber(int lineNumber) {
        line.setLineNumber(lineNumber);
    }

    public BigDecimal getLinePrice() {
        return line.getLinePrice();
    }

    public void setLinePrice(BigDecimal linePrice) {
        line.setLinePrice(linePrice);
    }

    public long getQuoteID() {
        return line.getQuoteID();
    }

    public void setQuoteID(long quoteID) {
        line.setQuoteID(quoteID);
    }

    public String getSummary() {
        return line.getSummary();
    }

    public void setSummary(String summary) {
        line.setSummary(summary);
    }

}
