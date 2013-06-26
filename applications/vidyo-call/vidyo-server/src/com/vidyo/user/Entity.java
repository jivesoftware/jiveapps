
package com.vidyo.user;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElementRef;
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
 *         &lt;element name="entityID" type="{http://portal.vidyo.com/user/v1_1}EntityID"/>
 *         &lt;element name="participantID" type="{http://portal.vidyo.com/user/v1_1}EntityID" minOccurs="0"/>
 *         &lt;element ref="{http://portal.vidyo.com/user/v1_1}EntityType"/>
 *         &lt;element name="ownerID" type="{http://portal.vidyo.com/user/v1_1}EntityID" minOccurs="0"/>
 *         &lt;element name="displayName" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="extension" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="emailAddress" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="tenant" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="description" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element ref="{http://portal.vidyo.com/user/v1_1}Language" minOccurs="0"/>
 *         &lt;element ref="{http://portal.vidyo.com/user/v1_1}MemberStatus" minOccurs="0"/>
 *         &lt;element ref="{http://portal.vidyo.com/user/v1_1}MemberMode" minOccurs="0"/>
 *         &lt;element name="canCallDirect" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="canJoinMeeting" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="canRecordMeeting" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="isInMyContacts" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element ref="{http://portal.vidyo.com/user/v1_1}RoomStatus" minOccurs="0"/>
 *         &lt;element ref="{http://portal.vidyo.com/user/v1_1}RoomMode" minOccurs="0"/>
 *         &lt;element name="canControl" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="audio" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="video" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
 *         &lt;element name="appshare" type="{http://www.w3.org/2001/XMLSchema}boolean" minOccurs="0"/>
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
    "entityID",
    "participantID",
    "entityType",
    "ownerID",
    "displayName",
    "extension",
    "emailAddress",
    "tenant",
    "description",
    "language",
    "memberStatus",
    "memberMode",
    "canCallDirect",
    "canJoinMeeting",
    "canRecordMeeting",
    "isInMyContacts",
    "roomStatus",
    "roomMode",
    "canControl",
    "audio",
    "video",
    "appshare"
})
@XmlRootElement(name = "Entity")
public class Entity {

    @XmlElement(required = true)
    protected String entityID;
    @XmlElementRef(name = "participantID", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> participantID;
    @XmlElement(name = "EntityType", required = true)
    protected String entityType;
    @XmlElementRef(name = "ownerID", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> ownerID;
    @XmlElement(required = true)
    protected String displayName;
    @XmlElement(required = true)
    protected String extension;
    @XmlElementRef(name = "emailAddress", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> emailAddress;
    @XmlElementRef(name = "tenant", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> tenant;
    protected String description;
    @XmlElement(name = "Language")
    protected String language;
    @XmlElement(name = "MemberStatus")
    protected String memberStatus;
    @XmlElement(name = "MemberMode")
    protected String memberMode;
    protected Boolean canCallDirect;
    protected Boolean canJoinMeeting;
    protected Boolean canRecordMeeting;
    protected Boolean isInMyContacts;
    @XmlElement(name = "RoomStatus")
    protected String roomStatus;
    @XmlElement(name = "RoomMode")
    protected RoomMode roomMode;
    protected Boolean canControl;
    @XmlElementRef(name = "audio", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<Boolean> audio;
    @XmlElementRef(name = "video", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<Boolean> video;
    @XmlElementRef(name = "appshare", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<Boolean> appshare;

    /**
     * Gets the value of the entityID property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEntityID() {
        return entityID;
    }

    /**
     * Sets the value of the entityID property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEntityID(String value) {
        this.entityID = value;
    }

    /**
     * Gets the value of the participantID property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getParticipantID() {
        return participantID;
    }

    /**
     * Sets the value of the participantID property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setParticipantID(JAXBElement<String> value) {
        this.participantID = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the entityType property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getEntityType() {
        return entityType;
    }

    /**
     * Sets the value of the entityType property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setEntityType(String value) {
        this.entityType = value;
    }

    /**
     * Gets the value of the ownerID property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getOwnerID() {
        return ownerID;
    }

    /**
     * Sets the value of the ownerID property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setOwnerID(JAXBElement<String> value) {
        this.ownerID = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the displayName property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Sets the value of the displayName property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setDisplayName(String value) {
        this.displayName = value;
    }

    /**
     * Gets the value of the extension property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getExtension() {
        return extension;
    }

    /**
     * Sets the value of the extension property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setExtension(String value) {
        this.extension = value;
    }

    /**
     * Gets the value of the emailAddress property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getEmailAddress() {
        return emailAddress;
    }

    /**
     * Sets the value of the emailAddress property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setEmailAddress(JAXBElement<String> value) {
        this.emailAddress = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the tenant property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getTenant() {
        return tenant;
    }

    /**
     * Sets the value of the tenant property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setTenant(JAXBElement<String> value) {
        this.tenant = ((JAXBElement<String> ) value);
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
     * Gets the value of the language property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLanguage() {
        return language;
    }

    /**
     * Sets the value of the language property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLanguage(String value) {
        this.language = value;
    }

    /**
     * Gets the value of the memberStatus property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMemberStatus() {
        return memberStatus;
    }

    /**
     * Sets the value of the memberStatus property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMemberStatus(String value) {
        this.memberStatus = value;
    }

    /**
     * Gets the value of the memberMode property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMemberMode() {
        return memberMode;
    }

    /**
     * Sets the value of the memberMode property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMemberMode(String value) {
        this.memberMode = value;
    }

    /**
     * Gets the value of the canCallDirect property.
     * 
     * @return
     *     possible object is
     *     {@link Boolean }
     *     
     */
    public Boolean isCanCallDirect() {
        return canCallDirect;
    }

    /**
     * Sets the value of the canCallDirect property.
     * 
     * @param value
     *     allowed object is
     *     {@link Boolean }
     *     
     */
    public void setCanCallDirect(Boolean value) {
        this.canCallDirect = value;
    }

    /**
     * Gets the value of the canJoinMeeting property.
     * 
     * @return
     *     possible object is
     *     {@link Boolean }
     *     
     */
    public Boolean isCanJoinMeeting() {
        return canJoinMeeting;
    }

    /**
     * Sets the value of the canJoinMeeting property.
     * 
     * @param value
     *     allowed object is
     *     {@link Boolean }
     *     
     */
    public void setCanJoinMeeting(Boolean value) {
        this.canJoinMeeting = value;
    }

    /**
     * Gets the value of the canRecordMeeting property.
     * 
     * @return
     *     possible object is
     *     {@link Boolean }
     *     
     */
    public Boolean isCanRecordMeeting() {
        return canRecordMeeting;
    }

    /**
     * Sets the value of the canRecordMeeting property.
     * 
     * @param value
     *     allowed object is
     *     {@link Boolean }
     *     
     */
    public void setCanRecordMeeting(Boolean value) {
        this.canRecordMeeting = value;
    }

    /**
     * Gets the value of the isInMyContacts property.
     * 
     * @return
     *     possible object is
     *     {@link Boolean }
     *     
     */
    public Boolean isIsInMyContacts() {
        return isInMyContacts;
    }

    /**
     * Sets the value of the isInMyContacts property.
     * 
     * @param value
     *     allowed object is
     *     {@link Boolean }
     *     
     */
    public void setIsInMyContacts(Boolean value) {
        this.isInMyContacts = value;
    }

    /**
     * Gets the value of the roomStatus property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getRoomStatus() {
        return roomStatus;
    }

    /**
     * Sets the value of the roomStatus property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setRoomStatus(String value) {
        this.roomStatus = value;
    }

    /**
     * Gets the value of the roomMode property.
     * 
     * @return
     *     possible object is
     *     {@link RoomMode }
     *     
     */
    public RoomMode getRoomMode() {
        return roomMode;
    }

    /**
     * Sets the value of the roomMode property.
     * 
     * @param value
     *     allowed object is
     *     {@link RoomMode }
     *     
     */
    public void setRoomMode(RoomMode value) {
        this.roomMode = value;
    }

    /**
     * Gets the value of the canControl property.
     * 
     * @return
     *     possible object is
     *     {@link Boolean }
     *     
     */
    public Boolean isCanControl() {
        return canControl;
    }

    /**
     * Sets the value of the canControl property.
     * 
     * @param value
     *     allowed object is
     *     {@link Boolean }
     *     
     */
    public void setCanControl(Boolean value) {
        this.canControl = value;
    }

    /**
     * Gets the value of the audio property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public JAXBElement<Boolean> getAudio() {
        return audio;
    }

    /**
     * Sets the value of the audio property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public void setAudio(JAXBElement<Boolean> value) {
        this.audio = ((JAXBElement<Boolean> ) value);
    }

    /**
     * Gets the value of the video property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public JAXBElement<Boolean> getVideo() {
        return video;
    }

    /**
     * Sets the value of the video property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public void setVideo(JAXBElement<Boolean> value) {
        this.video = ((JAXBElement<Boolean> ) value);
    }

    /**
     * Gets the value of the appshare property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public JAXBElement<Boolean> getAppshare() {
        return appshare;
    }

    /**
     * Sets the value of the appshare property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link Boolean }{@code >}
     *     
     */
    public void setAppshare(JAXBElement<Boolean> value) {
        this.appshare = ((JAXBElement<Boolean> ) value);
    }

}
