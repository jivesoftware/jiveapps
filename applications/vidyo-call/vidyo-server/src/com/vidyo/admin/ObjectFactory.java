
package com.vidyo.admin;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.vidyo.admin package. 
 * <p>An ObjectFactory allows you to programatically 
 * construct new instances of the Java representation 
 * for XML content. The Java representation of XML 
 * content can consist of schema derived interfaces 
 * and classes representing the binding of schema 
 * type definitions, element declarations and model 
 * groups.  Factory methods for each of these are 
 * provided in this class.
 * 
 */
@XmlRegistry
public class ObjectFactory {

    private final static QName _RoomStatus_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "RoomStatus");
    private final static QName _MemberMode_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "MemberMode");
    private final static QName _MemberStatus_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "MemberStatus");
    private final static QName _GetRecordingProfilesRequest_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "GetRecordingProfilesRequest");
    private final static QName _GetRoomProfilesRequest_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "GetRoomProfilesRequest");
    private final static QName _Language_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "Language");
    private final static QName _EntityType_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "EntityType");
    private final static QName _OK_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "OK");
    private final static QName _RoleName_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "RoleName");
    private final static QName _ErrorMessage_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "ErrorMessage");
    private final static QName _RoomType_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "RoomType");
    private final static QName _GetLicenseDataRequest_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "GetLicenseDataRequest");
    private final static QName _GetPortalVersionRequest_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "GetPortalVersionRequest");
    private final static QName _EntityParticipantID_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "participantID");
    private final static QName _EntityVideo_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "video");
    private final static QName _EntityAppshare_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "appshare");
    private final static QName _EntityAudio_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "audio");
    private final static QName _RoomModeModeratorPIN_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "moderatorPIN");
    private final static QName _RoomModeRoomPIN_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "roomPIN");
    private final static QName _RoomModeRoomURL_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "roomURL");
    private final static QName _GetWebcastURLResponseWebCastURL_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "webCastURL");
    private final static QName _FilterLimit_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "limit");
    private final static QName _FilterQuery_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "query");
    private final static QName _FilterDir_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "dir");
    private final static QName _FilterStart_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "start");
    private final static QName _FilterSortBy_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "sortBy");
    private final static QName _MemberPassword_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "password");
    private final static QName _GetParticipantsResponseRecorderName_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "recorderName");
    private final static QName _GetParticipantsResponsePaused_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "paused");
    private final static QName _GetParticipantsResponseRecorderID_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "recorderID");
    private final static QName _GetParticipantsResponseWebcast_QNAME = new QName("http://portal.vidyo.com/admin/v1_1", "webcast");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.vidyo.admin
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link Recorder }
     * 
     */
    public Recorder createRecorder() {
        return new Recorder();
    }

    /**
     * Create an instance of {@link InviteToConferenceResponse }
     * 
     */
    public InviteToConferenceResponse createInviteToConferenceResponse() {
        return new InviteToConferenceResponse();
    }

    /**
     * Create an instance of {@link CreateRoomPINResponse }
     * 
     */
    public CreateRoomPINResponse createCreateRoomPINResponse() {
        return new CreateRoomPINResponse();
    }

    /**
     * Create an instance of {@link UpdateMemberResponse }
     * 
     */
    public UpdateMemberResponse createUpdateMemberResponse() {
        return new UpdateMemberResponse();
    }

    /**
     * Create an instance of {@link GetWebcastURLResponse }
     * 
     */
    public GetWebcastURLResponse createGetWebcastURLResponse() {
        return new GetWebcastURLResponse();
    }

    /**
     * Create an instance of {@link GetMembersRequest }
     * 
     */
    public GetMembersRequest createGetMembersRequest() {
        return new GetMembersRequest();
    }

    /**
     * Create an instance of {@link AddGroupResponse }
     * 
     */
    public AddGroupResponse createAddGroupResponse() {
        return new AddGroupResponse();
    }

    /**
     * Create an instance of {@link GetLocationTagsResponse }
     * 
     */
    public GetLocationTagsResponse createGetLocationTagsResponse() {
        return new GetLocationTagsResponse();
    }

    /**
     * Create an instance of {@link InviteToConferenceRequest }
     * 
     */
    public InviteToConferenceRequest createInviteToConferenceRequest() {
        return new InviteToConferenceRequest();
    }

    /**
     * Create an instance of {@link DeleteGroupResponse }
     * 
     */
    public DeleteGroupResponse createDeleteGroupResponse() {
        return new DeleteGroupResponse();
    }

    /**
     * Create an instance of {@link UpdateGroupResponse }
     * 
     */
    public UpdateGroupResponse createUpdateGroupResponse() {
        return new UpdateGroupResponse();
    }

    /**
     * Create an instance of {@link UpdateRoomRequest }
     * 
     */
    public UpdateRoomRequest createUpdateRoomRequest() {
        return new UpdateRoomRequest();
    }

    /**
     * Create an instance of {@link MuteAudioResponse }
     * 
     */
    public MuteAudioResponse createMuteAudioResponse() {
        return new MuteAudioResponse();
    }

    /**
     * Create an instance of {@link RemoveRoomURLResponse }
     * 
     */
    public RemoveRoomURLResponse createRemoveRoomURLResponse() {
        return new RemoveRoomURLResponse();
    }

    /**
     * Create an instance of {@link UpdateRoomResponse }
     * 
     */
    public UpdateRoomResponse createUpdateRoomResponse() {
        return new UpdateRoomResponse();
    }

    /**
     * Create an instance of {@link RemoveWebcastPINResponse }
     * 
     */
    public RemoveWebcastPINResponse createRemoveWebcastPINResponse() {
        return new RemoveWebcastPINResponse();
    }

    /**
     * Create an instance of {@link CreateModeratorPINResponse }
     * 
     */
    public CreateModeratorPINResponse createCreateModeratorPINResponse() {
        return new CreateModeratorPINResponse();
    }

    /**
     * Create an instance of {@link GetRecordingProfilesResponse }
     * 
     */
    public GetRecordingProfilesResponse createGetRecordingProfilesResponse() {
        return new GetRecordingProfilesResponse();
    }

    /**
     * Create an instance of {@link GetRoomsResponse }
     * 
     */
    public GetRoomsResponse createGetRoomsResponse() {
        return new GetRoomsResponse();
    }

    /**
     * Create an instance of {@link GetRoomProfilesResponse }
     * 
     */
    public GetRoomProfilesResponse createGetRoomProfilesResponse() {
        return new GetRoomProfilesResponse();
    }

    /**
     * Create an instance of {@link Member }
     * 
     */
    public Member createMember() {
        return new Member();
    }

    /**
     * Create an instance of {@link GetRoomsRequest }
     * 
     */
    public GetRoomsRequest createGetRoomsRequest() {
        return new GetRoomsRequest();
    }

    /**
     * Create an instance of {@link StopVideoResponse }
     * 
     */
    public StopVideoResponse createStopVideoResponse() {
        return new StopVideoResponse();
    }

    /**
     * Create an instance of {@link GetMemberRequest }
     * 
     */
    public GetMemberRequest createGetMemberRequest() {
        return new GetMemberRequest();
    }

    /**
     * Create an instance of {@link UpdateGroupRequest }
     * 
     */
    public UpdateGroupRequest createUpdateGroupRequest() {
        return new UpdateGroupRequest();
    }

    /**
     * Create an instance of {@link DeleteRoomResponse }
     * 
     */
    public DeleteRoomResponse createDeleteRoomResponse() {
        return new DeleteRoomResponse();
    }

    /**
     * Create an instance of {@link MemberNotFoundFault }
     * 
     */
    public MemberNotFoundFault createMemberNotFoundFault() {
        return new MemberNotFoundFault();
    }

    /**
     * Create an instance of {@link DeleteMemberResponse }
     * 
     */
    public DeleteMemberResponse createDeleteMemberResponse() {
        return new DeleteMemberResponse();
    }

    /**
     * Create an instance of {@link RemoveModeratorPINRequest }
     * 
     */
    public RemoveModeratorPINRequest createRemoveModeratorPINRequest() {
        return new RemoveModeratorPINRequest();
    }

    /**
     * Create an instance of {@link AddRoomRequest }
     * 
     */
    public AddRoomRequest createAddRoomRequest() {
        return new AddRoomRequest();
    }

    /**
     * Create an instance of {@link CreateWebcastURLRequest }
     * 
     */
    public CreateWebcastURLRequest createCreateWebcastURLRequest() {
        return new CreateWebcastURLRequest();
    }

    /**
     * Create an instance of {@link StopRecordingRequest }
     * 
     */
    public StopRecordingRequest createStopRecordingRequest() {
        return new StopRecordingRequest();
    }

    /**
     * Create an instance of {@link AddMemberRequest }
     * 
     */
    public AddMemberRequest createAddMemberRequest() {
        return new AddMemberRequest();
    }

    /**
     * Create an instance of {@link Group }
     * 
     */
    public Group createGroup() {
        return new Group();
    }

    /**
     * Create an instance of {@link UpdateLanguageResponse }
     * 
     */
    public UpdateLanguageResponse createUpdateLanguageResponse() {
        return new UpdateLanguageResponse();
    }

    /**
     * Create an instance of {@link GetRoomResponse }
     * 
     */
    public GetRoomResponse createGetRoomResponse() {
        return new GetRoomResponse();
    }

    /**
     * Create an instance of {@link RemoveRoomPINRequest }
     * 
     */
    public RemoveRoomPINRequest createRemoveRoomPINRequest() {
        return new RemoveRoomPINRequest();
    }

    /**
     * Create an instance of {@link RemoveWebcastPINRequest }
     * 
     */
    public RemoveWebcastPINRequest createRemoveWebcastPINRequest() {
        return new RemoveWebcastPINRequest();
    }

    /**
     * Create an instance of {@link CreateWebcastURLResponse }
     * 
     */
    public CreateWebcastURLResponse createCreateWebcastURLResponse() {
        return new CreateWebcastURLResponse();
    }

    /**
     * Create an instance of {@link UnmuteAudioRequest }
     * 
     */
    public UnmuteAudioRequest createUnmuteAudioRequest() {
        return new UnmuteAudioRequest();
    }

    /**
     * Create an instance of {@link CreateRoomPINRequest }
     * 
     */
    public CreateRoomPINRequest createCreateRoomPINRequest() {
        return new CreateRoomPINRequest();
    }

    /**
     * Create an instance of {@link StartVideoResponse }
     * 
     */
    public StartVideoResponse createStartVideoResponse() {
        return new StartVideoResponse();
    }

    /**
     * Create an instance of {@link AddMemberResponse }
     * 
     */
    public AddMemberResponse createAddMemberResponse() {
        return new AddMemberResponse();
    }

    /**
     * Create an instance of {@link GetWebcastURLRequest }
     * 
     */
    public GetWebcastURLRequest createGetWebcastURLRequest() {
        return new GetWebcastURLRequest();
    }

    /**
     * Create an instance of {@link StartRecordingRequest }
     * 
     */
    public StartRecordingRequest createStartRecordingRequest() {
        return new StartRecordingRequest();
    }

    /**
     * Create an instance of {@link MemberAlreadyExistsFault }
     * 
     */
    public MemberAlreadyExistsFault createMemberAlreadyExistsFault() {
        return new MemberAlreadyExistsFault();
    }

    /**
     * Create an instance of {@link GetRoomRequest }
     * 
     */
    public GetRoomRequest createGetRoomRequest() {
        return new GetRoomRequest();
    }

    /**
     * Create an instance of {@link PauseRecordingRequest }
     * 
     */
    public PauseRecordingRequest createPauseRecordingRequest() {
        return new PauseRecordingRequest();
    }

    /**
     * Create an instance of {@link GetLicenseDataRequest }
     * 
     */
    public GetLicenseDataRequest createGetLicenseDataRequest() {
        return new GetLicenseDataRequest();
    }

    /**
     * Create an instance of {@link PauseRecordingResponse }
     * 
     */
    public PauseRecordingResponse createPauseRecordingResponse() {
        return new PauseRecordingResponse();
    }

    /**
     * Create an instance of {@link StopRecordingResponse }
     * 
     */
    public StopRecordingResponse createStopRecordingResponse() {
        return new StopRecordingResponse();
    }

    /**
     * Create an instance of {@link Entity }
     * 
     */
    public Entity createEntity() {
        return new Entity();
    }

    /**
     * Create an instance of {@link StartVideoRequest }
     * 
     */
    public StartVideoRequest createStartVideoRequest() {
        return new StartVideoRequest();
    }

    /**
     * Create an instance of {@link AddGroupRequest }
     * 
     */
    public AddGroupRequest createAddGroupRequest() {
        return new AddGroupRequest();
    }

    /**
     * Create an instance of {@link RemoveWebcastURLRequest }
     * 
     */
    public RemoveWebcastURLRequest createRemoveWebcastURLRequest() {
        return new RemoveWebcastURLRequest();
    }

    /**
     * Create an instance of {@link CreateModeratorPINRequest }
     * 
     */
    public CreateModeratorPINRequest createCreateModeratorPINRequest() {
        return new CreateModeratorPINRequest();
    }

    /**
     * Create an instance of {@link AddRoomResponse }
     * 
     */
    public AddRoomResponse createAddRoomResponse() {
        return new AddRoomResponse();
    }

    /**
     * Create an instance of {@link InvalidModeratorPINFormatFault }
     * 
     */
    public InvalidModeratorPINFormatFault createInvalidModeratorPINFormatFault() {
        return new InvalidModeratorPINFormatFault();
    }

    /**
     * Create an instance of {@link RoomProfile }
     * 
     */
    public RoomProfile createRoomProfile() {
        return new RoomProfile();
    }

    /**
     * Create an instance of {@link CreateWebcastPINRequest }
     * 
     */
    public CreateWebcastPINRequest createCreateWebcastPINRequest() {
        return new CreateWebcastPINRequest();
    }

    /**
     * Create an instance of {@link RemoveRoomPINResponse }
     * 
     */
    public RemoveRoomPINResponse createRemoveRoomPINResponse() {
        return new RemoveRoomPINResponse();
    }

    /**
     * Create an instance of {@link GetLicenseDataResponse }
     * 
     */
    public GetLicenseDataResponse createGetLicenseDataResponse() {
        return new GetLicenseDataResponse();
    }

    /**
     * Create an instance of {@link RemoveRoomProfileResponse }
     * 
     */
    public RemoveRoomProfileResponse createRemoveRoomProfileResponse() {
        return new RemoveRoomProfileResponse();
    }

    /**
     * Create an instance of {@link GetRoomProfileResponse }
     * 
     */
    public GetRoomProfileResponse createGetRoomProfileResponse() {
        return new GetRoomProfileResponse();
    }

    /**
     * Create an instance of {@link RemoveRoomProfileRequest }
     * 
     */
    public RemoveRoomProfileRequest createRemoveRoomProfileRequest() {
        return new RemoveRoomProfileRequest();
    }

    /**
     * Create an instance of {@link Tenant }
     * 
     */
    public Tenant createTenant() {
        return new Tenant();
    }

    /**
     * Create an instance of {@link UpdatePasswordRequest }
     * 
     */
    public UpdatePasswordRequest createUpdatePasswordRequest() {
        return new UpdatePasswordRequest();
    }

    /**
     * Create an instance of {@link CreateRoomURLRequest }
     * 
     */
    public CreateRoomURLRequest createCreateRoomURLRequest() {
        return new CreateRoomURLRequest();
    }

    /**
     * Create an instance of {@link RemoveWebcastURLResponse }
     * 
     */
    public RemoveWebcastURLResponse createRemoveWebcastURLResponse() {
        return new RemoveWebcastURLResponse();
    }

    /**
     * Create an instance of {@link GetParticipantsResponse }
     * 
     */
    public GetParticipantsResponse createGetParticipantsResponse() {
        return new GetParticipantsResponse();
    }

    /**
     * Create an instance of {@link SetRoomProfileRequest }
     * 
     */
    public SetRoomProfileRequest createSetRoomProfileRequest() {
        return new SetRoomProfileRequest();
    }

    /**
     * Create an instance of {@link LicenseFeatureData }
     * 
     */
    public LicenseFeatureData createLicenseFeatureData() {
        return new LicenseFeatureData();
    }

    /**
     * Create an instance of {@link ResourceNotAvailableFault }
     * 
     */
    public ResourceNotAvailableFault createResourceNotAvailableFault() {
        return new ResourceNotAvailableFault();
    }

    /**
     * Create an instance of {@link GetMemberResponse }
     * 
     */
    public GetMemberResponse createGetMemberResponse() {
        return new GetMemberResponse();
    }

    /**
     * Create an instance of {@link LeaveConferenceResponse }
     * 
     */
    public LeaveConferenceResponse createLeaveConferenceResponse() {
        return new LeaveConferenceResponse();
    }

    /**
     * Create an instance of {@link CreateWebcastPINResponse }
     * 
     */
    public CreateWebcastPINResponse createCreateWebcastPINResponse() {
        return new CreateWebcastPINResponse();
    }

    /**
     * Create an instance of {@link RoomMode }
     * 
     */
    public RoomMode createRoomMode() {
        return new RoomMode();
    }

    /**
     * Create an instance of {@link RoomNotFoundFault }
     * 
     */
    public RoomNotFoundFault createRoomNotFoundFault() {
        return new RoomNotFoundFault();
    }

    /**
     * Create an instance of {@link UpdateMemberRequest }
     * 
     */
    public UpdateMemberRequest createUpdateMemberRequest() {
        return new UpdateMemberRequest();
    }

    /**
     * Create an instance of {@link StopVideoRequest }
     * 
     */
    public StopVideoRequest createStopVideoRequest() {
        return new StopVideoRequest();
    }

    /**
     * Create an instance of {@link RoomAlreadyExistsFault }
     * 
     */
    public RoomAlreadyExistsFault createRoomAlreadyExistsFault() {
        return new RoomAlreadyExistsFault();
    }

    /**
     * Create an instance of {@link NotLicensedFault }
     * 
     */
    public NotLicensedFault createNotLicensedFault() {
        return new NotLicensedFault();
    }

    /**
     * Create an instance of {@link GetParticipantsRequest }
     * 
     */
    public GetParticipantsRequest createGetParticipantsRequest() {
        return new GetParticipantsRequest();
    }

    /**
     * Create an instance of {@link RemoveModeratorPINResponse }
     * 
     */
    public RemoveModeratorPINResponse createRemoveModeratorPINResponse() {
        return new RemoveModeratorPINResponse();
    }

    /**
     * Create an instance of {@link MuteAudioRequest }
     * 
     */
    public MuteAudioRequest createMuteAudioRequest() {
        return new MuteAudioRequest();
    }

    /**
     * Create an instance of {@link SetRoomProfileResponse }
     * 
     */
    public SetRoomProfileResponse createSetRoomProfileResponse() {
        return new SetRoomProfileResponse();
    }

    /**
     * Create an instance of {@link GetGroupResponse }
     * 
     */
    public GetGroupResponse createGetGroupResponse() {
        return new GetGroupResponse();
    }

    /**
     * Create an instance of {@link GetGroupsResponse }
     * 
     */
    public GetGroupsResponse createGetGroupsResponse() {
        return new GetGroupsResponse();
    }

    /**
     * Create an instance of {@link DeleteGroupRequest }
     * 
     */
    public DeleteGroupRequest createDeleteGroupRequest() {
        return new DeleteGroupRequest();
    }

    /**
     * Create an instance of {@link Location }
     * 
     */
    public Location createLocation() {
        return new Location();
    }

    /**
     * Create an instance of {@link GroupNotFoundFault }
     * 
     */
    public GroupNotFoundFault createGroupNotFoundFault() {
        return new GroupNotFoundFault();
    }

    /**
     * Create an instance of {@link GetLocationTagsRequest }
     * 
     */
    public GetLocationTagsRequest createGetLocationTagsRequest() {
        return new GetLocationTagsRequest();
    }

    /**
     * Create an instance of {@link Room }
     * 
     */
    public Room createRoom() {
        return new Room();
    }

    /**
     * Create an instance of {@link LeaveConferenceRequest }
     * 
     */
    public LeaveConferenceRequest createLeaveConferenceRequest() {
        return new LeaveConferenceRequest();
    }

    /**
     * Create an instance of {@link DeleteRoomRequest }
     * 
     */
    public DeleteRoomRequest createDeleteRoomRequest() {
        return new DeleteRoomRequest();
    }

    /**
     * Create an instance of {@link Filter }
     * 
     */
    public Filter createFilter() {
        return new Filter();
    }

    /**
     * Create an instance of {@link GroupAlreadyExistsFault }
     * 
     */
    public GroupAlreadyExistsFault createGroupAlreadyExistsFault() {
        return new GroupAlreadyExistsFault();
    }

    /**
     * Create an instance of {@link InvalidArgumentFault }
     * 
     */
    public InvalidArgumentFault createInvalidArgumentFault() {
        return new InvalidArgumentFault();
    }

    /**
     * Create an instance of {@link UpdateLanguageRequest }
     * 
     */
    public UpdateLanguageRequest createUpdateLanguageRequest() {
        return new UpdateLanguageRequest();
    }

    /**
     * Create an instance of {@link CreateRoomURLResponse }
     * 
     */
    public CreateRoomURLResponse createCreateRoomURLResponse() {
        return new CreateRoomURLResponse();
    }

    /**
     * Create an instance of {@link GetGroupRequest }
     * 
     */
    public GetGroupRequest createGetGroupRequest() {
        return new GetGroupRequest();
    }

    /**
     * Create an instance of {@link ResumeRecordingRequest }
     * 
     */
    public ResumeRecordingRequest createResumeRecordingRequest() {
        return new ResumeRecordingRequest();
    }

    /**
     * Create an instance of {@link StartRecordingResponse }
     * 
     */
    public StartRecordingResponse createStartRecordingResponse() {
        return new StartRecordingResponse();
    }

    /**
     * Create an instance of {@link DeleteMemberRequest }
     * 
     */
    public DeleteMemberRequest createDeleteMemberRequest() {
        return new DeleteMemberRequest();
    }

    /**
     * Create an instance of {@link GetMembersResponse }
     * 
     */
    public GetMembersResponse createGetMembersResponse() {
        return new GetMembersResponse();
    }

    /**
     * Create an instance of {@link GeneralFault }
     * 
     */
    public GeneralFault createGeneralFault() {
        return new GeneralFault();
    }

    /**
     * Create an instance of {@link GetGroupsRequest }
     * 
     */
    public GetGroupsRequest createGetGroupsRequest() {
        return new GetGroupsRequest();
    }

    /**
     * Create an instance of {@link GetRoomProfileRequest }
     * 
     */
    public GetRoomProfileRequest createGetRoomProfileRequest() {
        return new GetRoomProfileRequest();
    }

    /**
     * Create an instance of {@link RemoveRoomURLRequest }
     * 
     */
    public RemoveRoomURLRequest createRemoveRoomURLRequest() {
        return new RemoveRoomURLRequest();
    }

    /**
     * Create an instance of {@link GetPortalVersionResponse }
     * 
     */
    public GetPortalVersionResponse createGetPortalVersionResponse() {
        return new GetPortalVersionResponse();
    }

    /**
     * Create an instance of {@link UpdatePasswordResponse }
     * 
     */
    public UpdatePasswordResponse createUpdatePasswordResponse() {
        return new UpdatePasswordResponse();
    }

    /**
     * Create an instance of {@link UnmuteAudioResponse }
     * 
     */
    public UnmuteAudioResponse createUnmuteAudioResponse() {
        return new UnmuteAudioResponse();
    }

    /**
     * Create an instance of {@link ResumeRecordingResponse }
     * 
     */
    public ResumeRecordingResponse createResumeRecordingResponse() {
        return new ResumeRecordingResponse();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "RoomStatus")
    public JAXBElement<String> createRoomStatus(String value) {
        return new JAXBElement<String>(_RoomStatus_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "MemberMode")
    public JAXBElement<String> createMemberMode(String value) {
        return new JAXBElement<String>(_MemberMode_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "MemberStatus")
    public JAXBElement<String> createMemberStatus(String value) {
        return new JAXBElement<String>(_MemberStatus_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Object }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "GetRecordingProfilesRequest")
    public JAXBElement<Object> createGetRecordingProfilesRequest(Object value) {
        return new JAXBElement<Object>(_GetRecordingProfilesRequest_QNAME, Object.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Object }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "GetRoomProfilesRequest")
    public JAXBElement<Object> createGetRoomProfilesRequest(Object value) {
        return new JAXBElement<Object>(_GetRoomProfilesRequest_QNAME, Object.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "Language")
    public JAXBElement<String> createLanguage(String value) {
        return new JAXBElement<String>(_Language_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "EntityType")
    public JAXBElement<String> createEntityType(String value) {
        return new JAXBElement<String>(_EntityType_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "OK")
    public JAXBElement<String> createOK(String value) {
        return new JAXBElement<String>(_OK_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "RoleName")
    public JAXBElement<String> createRoleName(String value) {
        return new JAXBElement<String>(_RoleName_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "ErrorMessage")
    public JAXBElement<String> createErrorMessage(String value) {
        return new JAXBElement<String>(_ErrorMessage_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "RoomType")
    public JAXBElement<String> createRoomType(String value) {
        return new JAXBElement<String>(_RoomType_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link GetLicenseDataRequest }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "GetLicenseDataRequest")
    public JAXBElement<GetLicenseDataRequest> createGetLicenseDataRequest(GetLicenseDataRequest value) {
        return new JAXBElement<GetLicenseDataRequest>(_GetLicenseDataRequest_QNAME, GetLicenseDataRequest.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Object }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "GetPortalVersionRequest")
    public JAXBElement<Object> createGetPortalVersionRequest(Object value) {
        return new JAXBElement<Object>(_GetPortalVersionRequest_QNAME, Object.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Integer }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "participantID", scope = Entity.class)
    public JAXBElement<Integer> createEntityParticipantID(Integer value) {
        return new JAXBElement<Integer>(_EntityParticipantID_QNAME, Integer.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "video", scope = Entity.class)
    public JAXBElement<Boolean> createEntityVideo(Boolean value) {
        return new JAXBElement<Boolean>(_EntityVideo_QNAME, Boolean.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "appshare", scope = Entity.class)
    public JAXBElement<Boolean> createEntityAppshare(Boolean value) {
        return new JAXBElement<Boolean>(_EntityAppshare_QNAME, Boolean.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "audio", scope = Entity.class)
    public JAXBElement<Boolean> createEntityAudio(Boolean value) {
        return new JAXBElement<Boolean>(_EntityAudio_QNAME, Boolean.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "moderatorPIN", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeModeratorPIN(String value) {
        return new JAXBElement<String>(_RoomModeModeratorPIN_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "roomPIN", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeRoomPIN(String value) {
        return new JAXBElement<String>(_RoomModeRoomPIN_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "roomURL", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeRoomURL(String value) {
        return new JAXBElement<String>(_RoomModeRoomURL_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "webCastURL", scope = GetWebcastURLResponse.class)
    public JAXBElement<String> createGetWebcastURLResponseWebCastURL(String value) {
        return new JAXBElement<String>(_GetWebcastURLResponseWebCastURL_QNAME, String.class, GetWebcastURLResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Integer }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "limit", scope = Filter.class)
    public JAXBElement<Integer> createFilterLimit(Integer value) {
        return new JAXBElement<Integer>(_FilterLimit_QNAME, Integer.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "query", scope = Filter.class)
    public JAXBElement<String> createFilterQuery(String value) {
        return new JAXBElement<String>(_FilterQuery_QNAME, String.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link SortDir }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "dir", scope = Filter.class)
    public JAXBElement<SortDir> createFilterDir(SortDir value) {
        return new JAXBElement<SortDir>(_FilterDir_QNAME, SortDir.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Integer }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "start", scope = Filter.class)
    public JAXBElement<Integer> createFilterStart(Integer value) {
        return new JAXBElement<Integer>(_FilterStart_QNAME, Integer.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "sortBy", scope = Filter.class)
    public JAXBElement<String> createFilterSortBy(String value) {
        return new JAXBElement<String>(_FilterSortBy_QNAME, String.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "password", scope = Member.class)
    public JAXBElement<String> createMemberPassword(String value) {
        return new JAXBElement<String>(_MemberPassword_QNAME, String.class, Member.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "recorderName", scope = GetParticipantsResponse.class)
    public JAXBElement<String> createGetParticipantsResponseRecorderName(String value) {
        return new JAXBElement<String>(_GetParticipantsResponseRecorderName_QNAME, String.class, GetParticipantsResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "paused", scope = GetParticipantsResponse.class)
    public JAXBElement<Boolean> createGetParticipantsResponsePaused(Boolean value) {
        return new JAXBElement<Boolean>(_GetParticipantsResponsePaused_QNAME, Boolean.class, GetParticipantsResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Integer }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "recorderID", scope = GetParticipantsResponse.class)
    public JAXBElement<Integer> createGetParticipantsResponseRecorderID(Integer value) {
        return new JAXBElement<Integer>(_GetParticipantsResponseRecorderID_QNAME, Integer.class, GetParticipantsResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/admin/v1_1", name = "webcast", scope = GetParticipantsResponse.class)
    public JAXBElement<Boolean> createGetParticipantsResponseWebcast(Boolean value) {
        return new JAXBElement<Boolean>(_GetParticipantsResponseWebcast_QNAME, Boolean.class, GetParticipantsResponse.class, value);
    }

}
