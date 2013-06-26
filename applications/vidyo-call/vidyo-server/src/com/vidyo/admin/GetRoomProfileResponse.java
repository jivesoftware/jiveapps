
package com.vidyo.admin;

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
 *         &lt;element name="roomProfile" type="{http://portal.vidyo.com/admin/v1_1}RoomProfile"/>
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
    "roomProfile"
})
@XmlRootElement(name = "GetRoomProfileResponse")
public class GetRoomProfileResponse {

    @XmlElement(required = true, nillable = true)
    protected RoomProfile roomProfile;

    /**
     * Gets the value of the roomProfile property.
     * 
     * @return
     *     possible object is
     *     {@link RoomProfile }
     *     
     */
    public RoomProfile getRoomProfile() {
        return roomProfile;
    }

    /**
     * Sets the value of the roomProfile property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoomProfile }
     *     
     */
    public void setRoomProfile(RoomProfile value) {
        this.roomProfile = value;
    }

}
