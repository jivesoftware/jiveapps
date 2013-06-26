
package com.vidyo.user;

import javax.xml.bind.JAXBElement;
import javax.xml.bind.annotation.XmlElementDecl;
import javax.xml.bind.annotation.XmlRegistry;
import javax.xml.namespace.QName;


/**
 * This object contains factory methods for each 
 * Java content interface and Java element interface 
 * generated in the com.vidyo.user package. 
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

    private final static QName _OK_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "OK");
    private final static QName _GetRoomProfilesRequest_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "GetRoomProfilesRequest");
    private final static QName _ErrorMessage_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "ErrorMessage");
    private final static QName _Language_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "Language");
    private final static QName _RoomStatus_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "RoomStatus");
    private final static QName _EntityType_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "EntityType");
    private final static QName _MemberStatus_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "MemberStatus");
    private final static QName _MemberMode_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "MemberMode");
    private final static QName _MuteAudioRequestModeratorPIN_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "moderatorPIN");
    private final static QName _EntityAudio_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "audio");
    private final static QName _EntityTenant_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "tenant");
    private final static QName _EntityOwnerID_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "ownerID");
    private final static QName _EntityParticipantID_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "participantID");
    private final static QName _EntityEmailAddress_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "emailAddress");
    private final static QName _EntityVideo_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "video");
    private final static QName _EntityAppshare_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "appshare");
    private final static QName _GetWebcastURLResponseWebCastURL_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "webCastURL");
    private final static QName _FilterLimit_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "limit");
    private final static QName _FilterQuery_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "query");
    private final static QName _FilterSortBy_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "sortBy");
    private final static QName _FilterDir_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "dir");
    private final static QName _FilterStart_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "start");
    private final static QName _JoinIPCConferenceRequestPIN_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "PIN");
    private final static QName _LogInResponseVmaddress_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "vmaddress");
    private final static QName _LogInResponseLoctag_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "loctag");
    private final static QName _LogInResponseProxyaddress_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "proxyaddress");
    private final static QName _RoomModeRoomPIN_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "roomPIN");
    private final static QName _RoomModeRoomURL_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "roomURL");
    private final static QName _RoomModeWebCastPIN_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "webCastPIN");
    private final static QName _RoomModeHasModeratorPIN_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "hasModeratorPIN");
    private final static QName _GetParticipantsResponseRecorderID_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "recorderID");
    private final static QName _GetParticipantsResponseWebcast_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "webcast");
    private final static QName _GetParticipantsResponseRecorderName_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "recorderName");
    private final static QName _GetParticipantsResponsePaused_QNAME = new QName("http://portal.vidyo.com/user/v1_1", "paused");

    /**
     * Create a new ObjectFactory that can be used to create new instances of schema derived classes for package: com.vidyo.user
     * 
     */
    public ObjectFactory() {
    }

    /**
     * Create an instance of {@link MuteAudioRequest }
     * 
     */
    public MuteAudioRequest createMuteAudioRequest() {
        return new MuteAudioRequest();
    }

    /**
     * Create an instance of {@link RemoveRoomURLRequest }
     * 
     */
    public RemoveRoomURLRequest createRemoveRoomURLRequest() {
        return new RemoveRoomURLRequest();
    }

    /**
     * Create an instance of {@link CreateRoomURLResponse }
     * 
     */
    public CreateRoomURLResponse createCreateRoomURLResponse() {
        return new CreateRoomURLResponse();
    }

    /**
     * Create an instance of {@link SearchMyContactsRequest }
     * 
     */
    public SearchMyContactsRequest createSearchMyContactsRequest() {
        return new SearchMyContactsRequest();
    }

    /**
     * Create an instance of {@link GetRoomProfileResponse }
     * 
     */
    public GetRoomProfileResponse createGetRoomProfileResponse() {
        return new GetRoomProfileResponse();
    }

    /**
     * Create an instance of {@link SearchByEntityIDResponse }
     * 
     */
    public SearchByEntityIDResponse createSearchByEntityIDResponse() {
        return new SearchByEntityIDResponse();
    }

    /**
     * Create an instance of {@link CreateWebcastPINResponse }
     * 
     */
    public CreateWebcastPINResponse createCreateWebcastPINResponse() {
        return new CreateWebcastPINResponse();
    }

    /**
     * Create an instance of {@link GetPortalVersionRequest }
     * 
     */
    public GetPortalVersionRequest createGetPortalVersionRequest() {
        return new GetPortalVersionRequest();
    }

    /**
     * Create an instance of {@link GetEntityByEntityIDResponse }
     * 
     */
    public GetEntityByEntityIDResponse createGetEntityByEntityIDResponse() {
        return new GetEntityByEntityIDResponse();
    }

    /**
     * Create an instance of {@link SeatLicenseExpiredFault }
     * 
     */
    public SeatLicenseExpiredFault createSeatLicenseExpiredFault() {
        return new SeatLicenseExpiredFault();
    }

    /**
     * Create an instance of {@link StartRecordingRequest }
     * 
     */
    public StartRecordingRequest createStartRecordingRequest() {
        return new StartRecordingRequest();
    }

    /**
     * Create an instance of {@link UnmuteAudioRequest }
     * 
     */
    public UnmuteAudioRequest createUnmuteAudioRequest() {
        return new UnmuteAudioRequest();
    }

    /**
     * Create an instance of {@link DirectCallRequest }
     * 
     */
    public DirectCallRequest createDirectCallRequest() {
        return new DirectCallRequest();
    }

    /**
     * Create an instance of {@link CreateModeratorPINResponse }
     * 
     */
    public CreateModeratorPINResponse createCreateModeratorPINResponse() {
        return new CreateModeratorPINResponse();
    }

    /**
     * Create an instance of {@link UnmuteAudioResponse }
     * 
     */
    public UnmuteAudioResponse createUnmuteAudioResponse() {
        return new UnmuteAudioResponse();
    }

    /**
     * Create an instance of {@link LeaveConferenceResponse }
     * 
     */
    public LeaveConferenceResponse createLeaveConferenceResponse() {
        return new LeaveConferenceResponse();
    }

    /**
     * Create an instance of {@link SearchRequest }
     * 
     */
    public SearchRequest createSearchRequest() {
        return new SearchRequest();
    }

    /**
     * Create an instance of {@link DeleteRoomRequest }
     * 
     */
    public DeleteRoomRequest createDeleteRoomRequest() {
        return new DeleteRoomRequest();
    }

    /**
     * Create an instance of {@link ResumeRecordingResponse }
     * 
     */
    public ResumeRecordingResponse createResumeRecordingResponse() {
        return new ResumeRecordingResponse();
    }

    /**
     * Create an instance of {@link StartRecordingResponse }
     * 
     */
    public StartRecordingResponse createStartRecordingResponse() {
        return new StartRecordingResponse();
    }

    /**
     * Create an instance of {@link LogOutResponse }
     * 
     */
    public LogOutResponse createLogOutResponse() {
        return new LogOutResponse();
    }

    /**
     * Create an instance of {@link RemoveModeratorPINResponse }
     * 
     */
    public RemoveModeratorPINResponse createRemoveModeratorPINResponse() {
        return new RemoveModeratorPINResponse();
    }

    /**
     * Create an instance of {@link GetRoomProfilesResponse }
     * 
     */
    public GetRoomProfilesResponse createGetRoomProfilesResponse() {
        return new GetRoomProfilesResponse();
    }

    /**
     * Create an instance of {@link AddToMyContactsResponse }
     * 
     */
    public AddToMyContactsResponse createAddToMyContactsResponse() {
        return new AddToMyContactsResponse();
    }

    /**
     * Create an instance of {@link SearchByEntityIDRequest }
     * 
     */
    public SearchByEntityIDRequest createSearchByEntityIDRequest() {
        return new SearchByEntityIDRequest();
    }

    /**
     * Create an instance of {@link StopVideoResponse }
     * 
     */
    public StopVideoResponse createStopVideoResponse() {
        return new StopVideoResponse();
    }

    /**
     * Create an instance of {@link LockRoomResponse }
     * 
     */
    public LockRoomResponse createLockRoomResponse() {
        return new LockRoomResponse();
    }

    /**
     * Create an instance of {@link RemoveRoomPINResponse }
     * 
     */
    public RemoveRoomPINResponse createRemoveRoomPINResponse() {
        return new RemoveRoomPINResponse();
    }

    /**
     * Create an instance of {@link StopVideoRequest }
     * 
     */
    public StopVideoRequest createStopVideoRequest() {
        return new StopVideoRequest();
    }

    /**
     * Create an instance of {@link Recorder }
     * 
     */
    public Recorder createRecorder() {
        return new Recorder();
    }

    /**
     * Create an instance of {@link ResourceNotAvailableFault }
     * 
     */
    public ResourceNotAvailableFault createResourceNotAvailableFault() {
        return new ResourceNotAvailableFault();
    }

    /**
     * Create an instance of {@link LeaveConferenceRequest }
     * 
     */
    public LeaveConferenceRequest createLeaveConferenceRequest() {
        return new LeaveConferenceRequest();
    }

    /**
     * Create an instance of {@link MuteAudioResponse }
     * 
     */
    public MuteAudioResponse createMuteAudioResponse() {
        return new MuteAudioResponse();
    }

    /**
     * Create an instance of {@link Entity }
     * 
     */
    public Entity createEntity() {
        return new Entity();
    }

    /**
     * Create an instance of {@link GetWebcastURLResponse }
     * 
     */
    public GetWebcastURLResponse createGetWebcastURLResponse() {
        return new GetWebcastURLResponse();
    }

    /**
     * Create an instance of {@link UpdateLanguageResponse }
     * 
     */
    public UpdateLanguageResponse createUpdateLanguageResponse() {
        return new UpdateLanguageResponse();
    }

    /**
     * Create an instance of {@link GetRoomProfileRequest }
     * 
     */
    public GetRoomProfileRequest createGetRoomProfileRequest() {
        return new GetRoomProfileRequest();
    }

    /**
     * Create an instance of {@link GetEntityByRoomKeyResponse }
     * 
     */
    public GetEntityByRoomKeyResponse createGetEntityByRoomKeyResponse() {
        return new GetEntityByRoomKeyResponse();
    }

    /**
     * Create an instance of {@link MyAccountRequest }
     * 
     */
    public MyAccountRequest createMyAccountRequest() {
        return new MyAccountRequest();
    }

    /**
     * Create an instance of {@link GetEntityByEntityIDRequest }
     * 
     */
    public GetEntityByEntityIDRequest createGetEntityByEntityIDRequest() {
        return new GetEntityByEntityIDRequest();
    }

    /**
     * Create an instance of {@link SetRoomProfileRequest }
     * 
     */
    public SetRoomProfileRequest createSetRoomProfileRequest() {
        return new SetRoomProfileRequest();
    }

    /**
     * Create an instance of {@link RoomMode }
     * 
     */
    public RoomMode createRoomMode() {
        return new RoomMode();
    }

    /**
     * Create an instance of {@link InviteToConferenceResponse }
     * 
     */
    public InviteToConferenceResponse createInviteToConferenceResponse() {
        return new InviteToConferenceResponse();
    }

    /**
     * Create an instance of {@link GetParticipantsResponse }
     * 
     */
    public GetParticipantsResponse createGetParticipantsResponse() {
        return new GetParticipantsResponse();
    }

    /**
     * Create an instance of {@link SetMemberModeRequest }
     * 
     */
    public SetMemberModeRequest createSetMemberModeRequest() {
        return new SetMemberModeRequest();
    }

    /**
     * Create an instance of {@link DeleteRoomResponse }
     * 
     */
    public DeleteRoomResponse createDeleteRoomResponse() {
        return new DeleteRoomResponse();
    }

    /**
     * Create an instance of {@link MyEndpointStatusResponse }
     * 
     */
    public MyEndpointStatusResponse createMyEndpointStatusResponse() {
        return new MyEndpointStatusResponse();
    }

    /**
     * Create an instance of {@link DirectCallResponse }
     * 
     */
    public DirectCallResponse createDirectCallResponse() {
        return new DirectCallResponse();
    }

    /**
     * Create an instance of {@link InvalidArgumentFault }
     * 
     */
    public InvalidArgumentFault createInvalidArgumentFault() {
        return new InvalidArgumentFault();
    }

    /**
     * Create an instance of {@link PauseRecordingResponse }
     * 
     */
    public PauseRecordingResponse createPauseRecordingResponse() {
        return new PauseRecordingResponse();
    }

    /**
     * Create an instance of {@link GetWebcastURLRequest }
     * 
     */
    public GetWebcastURLRequest createGetWebcastURLRequest() {
        return new GetWebcastURLRequest();
    }

    /**
     * Create an instance of {@link MyAccountResponse }
     * 
     */
    public MyAccountResponse createMyAccountResponse() {
        return new MyAccountResponse();
    }

    /**
     * Create an instance of {@link InvalidModeratorPINFormatFault }
     * 
     */
    public InvalidModeratorPINFormatFault createInvalidModeratorPINFormatFault() {
        return new InvalidModeratorPINFormatFault();
    }

    /**
     * Create an instance of {@link SearchByEmailRequest }
     * 
     */
    public SearchByEmailRequest createSearchByEmailRequest() {
        return new SearchByEmailRequest();
    }

    /**
     * Create an instance of {@link ConferenceLockedFault }
     * 
     */
    public ConferenceLockedFault createConferenceLockedFault() {
        return new ConferenceLockedFault();
    }

    /**
     * Create an instance of {@link CreateRoomRequest }
     * 
     */
    public CreateRoomRequest createCreateRoomRequest() {
        return new CreateRoomRequest();
    }

    /**
     * Create an instance of {@link Filter }
     * 
     */
    public Filter createFilter() {
        return new Filter();
    }

    /**
     * Create an instance of {@link CreateRoomURLRequest }
     * 
     */
    public CreateRoomURLRequest createCreateRoomURLRequest() {
        return new CreateRoomURLRequest();
    }

    /**
     * Create an instance of {@link RemoveFromMyContactsRequest }
     * 
     */
    public RemoveFromMyContactsRequest createRemoveFromMyContactsRequest() {
        return new RemoveFromMyContactsRequest();
    }

    /**
     * Create an instance of {@link ControlMeetingFault }
     * 
     */
    public ControlMeetingFault createControlMeetingFault() {
        return new ControlMeetingFault();
    }

    /**
     * Create an instance of {@link SearchResponse }
     * 
     */
    public SearchResponse createSearchResponse() {
        return new SearchResponse();
    }

    /**
     * Create an instance of {@link GetEntityByRoomKeyRequest }
     * 
     */
    public GetEntityByRoomKeyRequest createGetEntityByRoomKeyRequest() {
        return new GetEntityByRoomKeyRequest();
    }

    /**
     * Create an instance of {@link InviteToConferenceRequest }
     * 
     */
    public InviteToConferenceRequest createInviteToConferenceRequest() {
        return new InviteToConferenceRequest();
    }

    /**
     * Create an instance of {@link RemoveRoomPINRequest }
     * 
     */
    public RemoveRoomPINRequest createRemoveRoomPINRequest() {
        return new RemoveRoomPINRequest();
    }

    /**
     * Create an instance of {@link GetInviteContentResponse }
     * 
     */
    public GetInviteContentResponse createGetInviteContentResponse() {
        return new GetInviteContentResponse();
    }

    /**
     * Create an instance of {@link CreateWebcastPINRequest }
     * 
     */
    public CreateWebcastPINRequest createCreateWebcastPINRequest() {
        return new CreateWebcastPINRequest();
    }

    /**
     * Create an instance of {@link LogInRequest }
     * 
     */
    public LogInRequest createLogInRequest() {
        return new LogInRequest();
    }

    /**
     * Create an instance of {@link UpdatePasswordRequest }
     * 
     */
    public UpdatePasswordRequest createUpdatePasswordRequest() {
        return new UpdatePasswordRequest();
    }

    /**
     * Create an instance of {@link UnlockRoomResponse }
     * 
     */
    public UnlockRoomResponse createUnlockRoomResponse() {
        return new UnlockRoomResponse();
    }

    /**
     * Create an instance of {@link CreateRoomResponse }
     * 
     */
    public CreateRoomResponse createCreateRoomResponse() {
        return new CreateRoomResponse();
    }

    /**
     * Create an instance of {@link RemoveRoomProfileResponse }
     * 
     */
    public RemoveRoomProfileResponse createRemoveRoomProfileResponse() {
        return new RemoveRoomProfileResponse();
    }

    /**
     * Create an instance of {@link CreateModeratorPINRequest }
     * 
     */
    public CreateModeratorPINRequest createCreateModeratorPINRequest() {
        return new CreateModeratorPINRequest();
    }

    /**
     * Create an instance of {@link CreateRoomPINRequest }
     * 
     */
    public CreateRoomPINRequest createCreateRoomPINRequest() {
        return new CreateRoomPINRequest();
    }

    /**
     * Create an instance of {@link WrongPINFault }
     * 
     */
    public WrongPINFault createWrongPINFault() {
        return new WrongPINFault();
    }

    /**
     * Create an instance of {@link StopRecordingRequest }
     * 
     */
    public StopRecordingRequest createStopRecordingRequest() {
        return new StopRecordingRequest();
    }

    /**
     * Create an instance of {@link CreateRoomPINResponse }
     * 
     */
    public CreateRoomPINResponse createCreateRoomPINResponse() {
        return new CreateRoomPINResponse();
    }

    /**
     * Create an instance of {@link RemoveWebcastPINResponse }
     * 
     */
    public RemoveWebcastPINResponse createRemoveWebcastPINResponse() {
        return new RemoveWebcastPINResponse();
    }

    /**
     * Create an instance of {@link SearchByEmailResponse }
     * 
     */
    public SearchByEmailResponse createSearchByEmailResponse() {
        return new SearchByEmailResponse();
    }

    /**
     * Create an instance of {@link UpdatePasswordResponse }
     * 
     */
    public UpdatePasswordResponse createUpdatePasswordResponse() {
        return new UpdatePasswordResponse();
    }

    /**
     * Create an instance of {@link CreateWebcastURLResponse }
     * 
     */
    public CreateWebcastURLResponse createCreateWebcastURLResponse() {
        return new CreateWebcastURLResponse();
    }

    /**
     * Create an instance of {@link GetRecordingProfilesRequest }
     * 
     */
    public GetRecordingProfilesRequest createGetRecordingProfilesRequest() {
        return new GetRecordingProfilesRequest();
    }

    /**
     * Create an instance of {@link CreateWebcastURLRequest }
     * 
     */
    public CreateWebcastURLRequest createCreateWebcastURLRequest() {
        return new CreateWebcastURLRequest();
    }

    /**
     * Create an instance of {@link StopRecordingResponse }
     * 
     */
    public StopRecordingResponse createStopRecordingResponse() {
        return new StopRecordingResponse();
    }

    /**
     * Create an instance of {@link GetUserNameRequest }
     * 
     */
    public GetUserNameRequest createGetUserNameRequest() {
        return new GetUserNameRequest();
    }

    /**
     * Create an instance of {@link GetPortalVersionResponse }
     * 
     */
    public GetPortalVersionResponse createGetPortalVersionResponse() {
        return new GetPortalVersionResponse();
    }

    /**
     * Create an instance of {@link RemoveWebcastURLResponse }
     * 
     */
    public RemoveWebcastURLResponse createRemoveWebcastURLResponse() {
        return new RemoveWebcastURLResponse();
    }

    /**
     * Create an instance of {@link LinkEndpointRequest }
     * 
     */
    public LinkEndpointRequest createLinkEndpointRequest() {
        return new LinkEndpointRequest();
    }

    /**
     * Create an instance of {@link RemoveRoomURLResponse }
     * 
     */
    public RemoveRoomURLResponse createRemoveRoomURLResponse() {
        return new RemoveRoomURLResponse();
    }

    /**
     * Create an instance of {@link LockRoomRequest }
     * 
     */
    public LockRoomRequest createLockRoomRequest() {
        return new LockRoomRequest();
    }

    /**
     * Create an instance of {@link RemoveWebcastURLRequest }
     * 
     */
    public RemoveWebcastURLRequest createRemoveWebcastURLRequest() {
        return new RemoveWebcastURLRequest();
    }

    /**
     * Create an instance of {@link RemoveModeratorPINRequest }
     * 
     */
    public RemoveModeratorPINRequest createRemoveModeratorPINRequest() {
        return new RemoveModeratorPINRequest();
    }

    /**
     * Create an instance of {@link MyEndpointStatusRequest }
     * 
     */
    public MyEndpointStatusRequest createMyEndpointStatusRequest() {
        return new MyEndpointStatusRequest();
    }

    /**
     * Create an instance of {@link UpdateLanguageRequest }
     * 
     */
    public UpdateLanguageRequest createUpdateLanguageRequest() {
        return new UpdateLanguageRequest();
    }

    /**
     * Create an instance of {@link LogOutRequest }
     * 
     */
    public LogOutRequest createLogOutRequest() {
        return new LogOutRequest();
    }

    /**
     * Create an instance of {@link RemoveRoomProfileRequest }
     * 
     */
    public RemoveRoomProfileRequest createRemoveRoomProfileRequest() {
        return new RemoveRoomProfileRequest();
    }

    /**
     * Create an instance of {@link LinkEndpointResponse }
     * 
     */
    public LinkEndpointResponse createLinkEndpointResponse() {
        return new LinkEndpointResponse();
    }

    /**
     * Create an instance of {@link JoinConferenceResponse }
     * 
     */
    public JoinConferenceResponse createJoinConferenceResponse() {
        return new JoinConferenceResponse();
    }

    /**
     * Create an instance of {@link StartVideoRequest }
     * 
     */
    public StartVideoRequest createStartVideoRequest() {
        return new StartVideoRequest();
    }

    /**
     * Create an instance of {@link JoinIPCConferenceRequest }
     * 
     */
    public JoinIPCConferenceRequest createJoinIPCConferenceRequest() {
        return new JoinIPCConferenceRequest();
    }

    /**
     * Create an instance of {@link NotLicensedFault }
     * 
     */
    public NotLicensedFault createNotLicensedFault() {
        return new NotLicensedFault();
    }

    /**
     * Create an instance of {@link GetRecordingProfilesResponse }
     * 
     */
    public GetRecordingProfilesResponse createGetRecordingProfilesResponse() {
        return new GetRecordingProfilesResponse();
    }

    /**
     * Create an instance of {@link JoinConferenceRequest }
     * 
     */
    public JoinConferenceRequest createJoinConferenceRequest() {
        return new JoinConferenceRequest();
    }

    /**
     * Create an instance of {@link JoinIPCConferenceResponse }
     * 
     */
    public JoinIPCConferenceResponse createJoinIPCConferenceResponse() {
        return new JoinIPCConferenceResponse();
    }

    /**
     * Create an instance of {@link GetInviteContentRequest }
     * 
     */
    public GetInviteContentRequest createGetInviteContentRequest() {
        return new GetInviteContentRequest();
    }

    /**
     * Create an instance of {@link AccessRestrictedFault }
     * 
     */
    public AccessRestrictedFault createAccessRestrictedFault() {
        return new AccessRestrictedFault();
    }

    /**
     * Create an instance of {@link StartVideoResponse }
     * 
     */
    public StartVideoResponse createStartVideoResponse() {
        return new StartVideoResponse();
    }

    /**
     * Create an instance of {@link UnlockRoomRequest }
     * 
     */
    public UnlockRoomRequest createUnlockRoomRequest() {
        return new UnlockRoomRequest();
    }

    /**
     * Create an instance of {@link RemoveWebcastPINRequest }
     * 
     */
    public RemoveWebcastPINRequest createRemoveWebcastPINRequest() {
        return new RemoveWebcastPINRequest();
    }

    /**
     * Create an instance of {@link SetRoomProfileResponse }
     * 
     */
    public SetRoomProfileResponse createSetRoomProfileResponse() {
        return new SetRoomProfileResponse();
    }

    /**
     * Create an instance of {@link SetMemberModeResponse }
     * 
     */
    public SetMemberModeResponse createSetMemberModeResponse() {
        return new SetMemberModeResponse();
    }

    /**
     * Create an instance of {@link RemoveFromMyContactsResponse }
     * 
     */
    public RemoveFromMyContactsResponse createRemoveFromMyContactsResponse() {
        return new RemoveFromMyContactsResponse();
    }

    /**
     * Create an instance of {@link RoomProfile }
     * 
     */
    public RoomProfile createRoomProfile() {
        return new RoomProfile();
    }

    /**
     * Create an instance of {@link PauseRecordingRequest }
     * 
     */
    public PauseRecordingRequest createPauseRecordingRequest() {
        return new PauseRecordingRequest();
    }

    /**
     * Create an instance of {@link SearchMyContactsResponse }
     * 
     */
    public SearchMyContactsResponse createSearchMyContactsResponse() {
        return new SearchMyContactsResponse();
    }

    /**
     * Create an instance of {@link GetParticipantsRequest }
     * 
     */
    public GetParticipantsRequest createGetParticipantsRequest() {
        return new GetParticipantsRequest();
    }

    /**
     * Create an instance of {@link GeneralFault }
     * 
     */
    public GeneralFault createGeneralFault() {
        return new GeneralFault();
    }

    /**
     * Create an instance of {@link AddToMyContactsRequest }
     * 
     */
    public AddToMyContactsRequest createAddToMyContactsRequest() {
        return new AddToMyContactsRequest();
    }

    /**
     * Create an instance of {@link LogInResponse }
     * 
     */
    public LogInResponse createLogInResponse() {
        return new LogInResponse();
    }

    /**
     * Create an instance of {@link GetUserNameResponse }
     * 
     */
    public GetUserNameResponse createGetUserNameResponse() {
        return new GetUserNameResponse();
    }

    /**
     * Create an instance of {@link ResumeRecordingRequest }
     * 
     */
    public ResumeRecordingRequest createResumeRecordingRequest() {
        return new ResumeRecordingRequest();
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "OK")
    public JAXBElement<String> createOK(String value) {
        return new JAXBElement<String>(_OK_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Object }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "GetRoomProfilesRequest")
    public JAXBElement<Object> createGetRoomProfilesRequest(Object value) {
        return new JAXBElement<Object>(_GetRoomProfilesRequest_QNAME, Object.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "ErrorMessage")
    public JAXBElement<String> createErrorMessage(String value) {
        return new JAXBElement<String>(_ErrorMessage_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "Language")
    public JAXBElement<String> createLanguage(String value) {
        return new JAXBElement<String>(_Language_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "RoomStatus")
    public JAXBElement<String> createRoomStatus(String value) {
        return new JAXBElement<String>(_RoomStatus_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "EntityType")
    public JAXBElement<String> createEntityType(String value) {
        return new JAXBElement<String>(_EntityType_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "MemberStatus")
    public JAXBElement<String> createMemberStatus(String value) {
        return new JAXBElement<String>(_MemberStatus_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "MemberMode")
    public JAXBElement<String> createMemberMode(String value) {
        return new JAXBElement<String>(_MemberMode_QNAME, String.class, null, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = MuteAudioRequest.class)
    public JAXBElement<String> createMuteAudioRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, MuteAudioRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = StartRecordingRequest.class)
    public JAXBElement<String> createStartRecordingRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, StartRecordingRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = UnmuteAudioRequest.class)
    public JAXBElement<String> createUnmuteAudioRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, UnmuteAudioRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = StopVideoRequest.class)
    public JAXBElement<String> createStopVideoRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, StopVideoRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = UnlockRoomRequest.class)
    public JAXBElement<String> createUnlockRoomRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, UnlockRoomRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = LeaveConferenceRequest.class)
    public JAXBElement<String> createLeaveConferenceRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, LeaveConferenceRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "audio", scope = Entity.class)
    public JAXBElement<Boolean> createEntityAudio(Boolean value) {
        return new JAXBElement<Boolean>(_EntityAudio_QNAME, Boolean.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "tenant", scope = Entity.class)
    public JAXBElement<String> createEntityTenant(String value) {
        return new JAXBElement<String>(_EntityTenant_QNAME, String.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "ownerID", scope = Entity.class)
    public JAXBElement<String> createEntityOwnerID(String value) {
        return new JAXBElement<String>(_EntityOwnerID_QNAME, String.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "participantID", scope = Entity.class)
    public JAXBElement<String> createEntityParticipantID(String value) {
        return new JAXBElement<String>(_EntityParticipantID_QNAME, String.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "emailAddress", scope = Entity.class)
    public JAXBElement<String> createEntityEmailAddress(String value) {
        return new JAXBElement<String>(_EntityEmailAddress_QNAME, String.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "video", scope = Entity.class)
    public JAXBElement<Boolean> createEntityVideo(Boolean value) {
        return new JAXBElement<Boolean>(_EntityVideo_QNAME, Boolean.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "appshare", scope = Entity.class)
    public JAXBElement<Boolean> createEntityAppshare(Boolean value) {
        return new JAXBElement<Boolean>(_EntityAppshare_QNAME, Boolean.class, Entity.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "webCastURL", scope = GetWebcastURLResponse.class)
    public JAXBElement<String> createGetWebcastURLResponseWebCastURL(String value) {
        return new JAXBElement<String>(_GetWebcastURLResponseWebCastURL_QNAME, String.class, GetWebcastURLResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Integer }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "limit", scope = Filter.class)
    public JAXBElement<Integer> createFilterLimit(Integer value) {
        return new JAXBElement<Integer>(_FilterLimit_QNAME, Integer.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "query", scope = Filter.class)
    public JAXBElement<String> createFilterQuery(String value) {
        return new JAXBElement<String>(_FilterQuery_QNAME, String.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "sortBy", scope = Filter.class)
    public JAXBElement<String> createFilterSortBy(String value) {
        return new JAXBElement<String>(_FilterSortBy_QNAME, String.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link SortDir }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "dir", scope = Filter.class)
    public JAXBElement<SortDir> createFilterDir(SortDir value) {
        return new JAXBElement<SortDir>(_FilterDir_QNAME, SortDir.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Integer }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "start", scope = Filter.class)
    public JAXBElement<Integer> createFilterStart(Integer value) {
        return new JAXBElement<Integer>(_FilterStart_QNAME, Integer.class, Filter.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = StartVideoRequest.class)
    public JAXBElement<String> createStartVideoRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, StartVideoRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = PauseRecordingRequest.class)
    public JAXBElement<String> createPauseRecordingRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, PauseRecordingRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = GetParticipantsRequest.class)
    public JAXBElement<String> createGetParticipantsRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, GetParticipantsRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "PIN", scope = JoinIPCConferenceRequest.class)
    public JAXBElement<String> createJoinIPCConferenceRequestPIN(String value) {
        return new JAXBElement<String>(_JoinIPCConferenceRequestPIN_QNAME, String.class, JoinIPCConferenceRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = StopRecordingRequest.class)
    public JAXBElement<String> createStopRecordingRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, StopRecordingRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "vmaddress", scope = LogInResponse.class)
    public JAXBElement<String> createLogInResponseVmaddress(String value) {
        return new JAXBElement<String>(_LogInResponseVmaddress_QNAME, String.class, LogInResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "loctag", scope = LogInResponse.class)
    public JAXBElement<String> createLogInResponseLoctag(String value) {
        return new JAXBElement<String>(_LogInResponseLoctag_QNAME, String.class, LogInResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "proxyaddress", scope = LogInResponse.class)
    public JAXBElement<String> createLogInResponseProxyaddress(String value) {
        return new JAXBElement<String>(_LogInResponseProxyaddress_QNAME, String.class, LogInResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = ResumeRecordingRequest.class)
    public JAXBElement<String> createResumeRecordingRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, ResumeRecordingRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "roomPIN", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeRoomPIN(String value) {
        return new JAXBElement<String>(_RoomModeRoomPIN_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "roomURL", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeRoomURL(String value) {
        return new JAXBElement<String>(_RoomModeRoomURL_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "webCastURL", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeWebCastURL(String value) {
        return new JAXBElement<String>(_GetWebcastURLResponseWebCastURL_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "webCastPIN", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeWebCastPIN(String value) {
        return new JAXBElement<String>(_RoomModeWebCastPIN_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "hasModeratorPIN", scope = RoomMode.class)
    public JAXBElement<Boolean> createRoomModeHasModeratorPIN(Boolean value) {
        return new JAXBElement<Boolean>(_RoomModeHasModeratorPIN_QNAME, Boolean.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = RoomMode.class)
    public JAXBElement<String> createRoomModeModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, RoomMode.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Integer }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "recorderID", scope = GetParticipantsResponse.class)
    public JAXBElement<Integer> createGetParticipantsResponseRecorderID(Integer value) {
        return new JAXBElement<Integer>(_GetParticipantsResponseRecorderID_QNAME, Integer.class, GetParticipantsResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "webcast", scope = GetParticipantsResponse.class)
    public JAXBElement<Boolean> createGetParticipantsResponseWebcast(Boolean value) {
        return new JAXBElement<Boolean>(_GetParticipantsResponseWebcast_QNAME, Boolean.class, GetParticipantsResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "recorderName", scope = GetParticipantsResponse.class)
    public JAXBElement<String> createGetParticipantsResponseRecorderName(String value) {
        return new JAXBElement<String>(_GetParticipantsResponseRecorderName_QNAME, String.class, GetParticipantsResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link Boolean }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "paused", scope = GetParticipantsResponse.class)
    public JAXBElement<Boolean> createGetParticipantsResponsePaused(Boolean value) {
        return new JAXBElement<Boolean>(_GetParticipantsResponsePaused_QNAME, Boolean.class, GetParticipantsResponse.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "PIN", scope = JoinConferenceRequest.class)
    public JAXBElement<String> createJoinConferenceRequestPIN(String value) {
        return new JAXBElement<String>(_JoinIPCConferenceRequestPIN_QNAME, String.class, JoinConferenceRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = InviteToConferenceRequest.class)
    public JAXBElement<String> createInviteToConferenceRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, InviteToConferenceRequest.class, value);
    }

    /**
     * Create an instance of {@link JAXBElement }{@code <}{@link String }{@code >}}
     * 
     */
    @XmlElementDecl(namespace = "http://portal.vidyo.com/user/v1_1", name = "moderatorPIN", scope = LockRoomRequest.class)
    public JAXBElement<String> createLockRoomRequestModeratorPIN(String value) {
        return new JAXBElement<String>(_MuteAudioRequestModeratorPIN_QNAME, String.class, LockRoomRequest.class, value);
    }

}
