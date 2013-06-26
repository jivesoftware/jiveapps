
package com.vidyo.admin;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlType;


/**
 * 
 * 						Group Description on VidyoPortal.
 *                         All the members and rooms belong to the same group share the same properties.
 * 					
 * 
 * <p>Java class for Group complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="Group">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="groupID" type="{http://portal.vidyo.com/admin/v1_1}EntityID" minOccurs="0"/>
 *         &lt;element name="name" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="roomMaxUsers" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="userMaxBandWidthIn" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="userMaxBandWidthOut" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="description" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="allowRecording" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "Group", propOrder = {
    "groupID",
    "name",
    "roomMaxUsers",
    "userMaxBandWidthIn",
    "userMaxBandWidthOut",
    "description",
    "allowRecording"
})
public class Group {

    protected Integer groupID;
    @XmlElement(required = true)
    protected String name;
    @XmlElement(required = true)
    protected String roomMaxUsers;
    @XmlElement(required = true)
    protected String userMaxBandWidthIn;
    @XmlElement(required = true)
    protected String userMaxBandWidthOut;
    protected String description;
    protected Boolean allowRecording;

    /**
     * Gets the value of the groupID property.
     * 
     * @return
     *     possible object is
     *     {@link Integer }
     *     
     */
    public Integer getGroupID() {
        return groupID;
    }

    /**
     * Sets the value of the groupID property.
     * 
     * @param value
     *     allowed object is
     *     {@link Integer }
     *     
     */
    public void setGroupID(Integer value) {
        this.groupID = value;
    }

    /**
     * Gets the value of the name property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the value of the name property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setName(String value) {
        this.name = value;
    }

    /**
     * Gets the value of the roomMaxUsers property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRoomMaxUsers() {
        return roomMaxUsers;
    }

    /**
     * Sets the value of the roomMaxUsers property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRoomMaxUsers(String value) {
        this.roomMaxUsers = value;
    }

    /**
     * Gets the value of the userMaxBandWidthIn property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUserMaxBandWidthIn() {
        return userMaxBandWidthIn;
    }

    /**
     * Sets the value of the userMaxBandWidthIn property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUserMaxBandWidthIn(String value) {
        this.userMaxBandWidthIn = value;
    }

    /**
     * Gets the value of the userMaxBandWidthOut property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getUserMaxBandWidthOut() {
        return userMaxBandWidthOut;
    }

    /**
     * Sets the value of the userMaxBandWidthOut property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setUserMaxBandWidthOut(String value) {
        this.userMaxBandWidthOut = value;
    }

    /**
     * Gets the value of the description property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the value of the description property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDescription(String value) {
        this.description = value;
    }

    /**
     * Gets the value of the allowRecording property.
     * 
     * @return
     *     possible object is
     *     {@link Boolean }
     *     
     */
    public Boolean isAllowRecording() {
        return allowRecording;
    }

    /**
     * Sets the value of the allowRecording property.
     * 
     * @param value
     *     allowed object is
     *     {@link Boolean }
     *     
     */
    public void setAllowRecording(Boolean value) {
        this.allowRecording = value;
    }

}
