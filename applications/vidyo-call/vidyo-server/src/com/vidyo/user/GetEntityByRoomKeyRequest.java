
package com.vidyo.user;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for anonymous complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="roomKey" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "roomKey"
})
@XmlRootElement(name = "GetEntityByRoomKeyRequest")
public class GetEntityByRoomKeyRequest {

    @XmlElement(required = true)
    protected String roomKey;

    /**
     * Gets the value of the roomKey property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRoomKey() {
        return roomKey;
    }

    /**
     * Sets the value of the roomKey property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRoomKey(String value) {
        this.roomKey = value;
    }

}
