
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
 *         &lt;element name="pak" type="{http://www.w3.org/2001/XMLSchema}string"/>
 *         &lt;element name="vmaddress" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="proxyaddress" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         &lt;element name="loctag" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
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
    "pak",
    "vmaddress",
    "proxyaddress",
    "loctag"
})
@XmlRootElement(name = "LogInResponse")
public class LogInResponse {

    @XmlElement(required = true)
    protected String pak;
    @XmlElementRef(name = "vmaddress", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> vmaddress;
    @XmlElementRef(name = "proxyaddress", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> proxyaddress;
    @XmlElementRef(name = "loctag", namespace = "http://portal.vidyo.com/user/v1_1", type = JAXBElement.class)
    protected JAXBElement<String> loctag;

    /**
     * Gets the value of the pak property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getPak() {
        return pak;
    }

    /**
     * Sets the value of the pak property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setPak(String value) {
        this.pak = value;
    }

    /**
     * Gets the value of the vmaddress property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getVmaddress() {
        return vmaddress;
    }

    /**
     * Sets the value of the vmaddress property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setVmaddress(JAXBElement<String> value) {
        this.vmaddress = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the proxyaddress property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getProxyaddress() {
        return proxyaddress;
    }

    /**
     * Sets the value of the proxyaddress property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setProxyaddress(JAXBElement<String> value) {
        this.proxyaddress = ((JAXBElement<String> ) value);
    }

    /**
     * Gets the value of the loctag property.
     * 
     * @return
     *     possible object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public JAXBElement<String> getLoctag() {
        return loctag;
    }

    /**
     * Sets the value of the loctag property.
     * 
     * @param value
     *     allowed object is
     *     {@link JAXBElement }{@code <}{@link String }{@code >}
     *     
     */
    public void setLoctag(JAXBElement<String> value) {
        this.loctag = ((JAXBElement<String> ) value);
    }

}
