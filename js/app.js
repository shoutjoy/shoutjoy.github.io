// ezlive - P2P Video Chat Application
// Using PeerJS for WebRTC connections

class EzLive {
    constructor() {
        this.peer = null;
        this.connection = null;
        this.call = null;
        this.localStream = null;
        this.isHost = false;
        this.isVideoEnabled = true;
        this.isAudioEnabled = true;
        this.isScreenSharing = false;
        this.screenStream = null;
        this.originalStream = null;
        this.isFullscreen = false;
        this.chatHistory = [];
        this.chatWindow = null;
        this.chatViewMode = 'sidebar';
        this.isChatFullscreen = false;
        this.fullscreenChatButton = null;
        this.myName = '';
        this.remoteName = '';
        this.isChatVisible = true;
        this.pendingScreenShareRequest = null;
        this.drawingCanvas = null;
        this.drawingContext = null;
        this.isDrawing = false;
        this.isEraser = false;
        this.isPointer = false;
        this.pointerElement = null;
        this.drawingWindow = null;
        // 판서 도구 설정 (가상 요소)
        this.drawColor = { value: '#ff0000' };
        this.drawWidth = { value: 3 };
        this.whiteboardWindow = null;
        this.whiteboardStream = null;
        this.isWhiteboardActive = false;
        this.screenShareDrawingCanvas = null;
        this.screenShareDrawingContext = null;
        this.isScreenShareDrawing = false;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.invitationCode = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupChatSync();
        this.checkInvitationLink();
        this.setupMobileChat();
    }

    initializeElements() {
        // Step elements
        this.step0 = document.getElementById('step0');
        this.stepTeacherAuth = document.getElementById('stepTeacherAuth');
        this.step1 = document.getElementById('step1');
        this.step2 = document.getElementById('step2');
        this.step3 = document.getElementById('step3');
        
        // Cards
        this.teacherCard = document.getElementById('teacherCard');
        this.studentCard = document.getElementById('studentCard');

        // Buttons
        this.selectTeacherBtn = document.getElementById('selectTeacherBtn');
        this.selectStudentBtn = document.getElementById('selectStudentBtn');
        this.teacherAuthBtn = document.getElementById('teacherAuthBtn');
        this.backToSelectBtn = document.getElementById('backToSelectBtn');
        this.backToSelectFromStudentBtn = document.getElementById('backToSelectFromStudentBtn');
        this.createHostBtn = document.getElementById('createHostBtn');
        this.joinBtn = document.getElementById('joinBtn');
        this.copyBtn = document.getElementById('copyBtn');
        this.sendBtn = document.getElementById('sendBtn');
        this.toggleVideoBtn = document.getElementById('toggleVideoBtn');
        this.toggleAudioBtn = document.getElementById('toggleAudioBtn');
        this.shareScreenBtn = document.getElementById('shareScreenBtn');
        this.toggleChatBtn = document.getElementById('toggleChatBtn');
        this.closeChatBtn = document.getElementById('closeChatBtn');
        this.downloadChatBtn = document.getElementById('downloadChatBtn');
        this.remotePipBtn = document.getElementById('remotePipBtn');
        this.localPipBtn = document.getElementById('localPipBtn');
        this.remoteMaximizeBtn = document.getElementById('remoteMaximizeBtn');
        this.localMaximizeBtn = document.getElementById('localMaximizeBtn');
        this.fullscreenBtn = document.getElementById('fullscreenBtn');
        this.localFullscreenBtn = document.getElementById('localFullscreenBtn');
        this.fullscreenChatBtn = document.getElementById('fullscreenChatBtn');
        this.popoutChatBtn = document.getElementById('popoutChatBtn');
        this.fileBtn = document.getElementById('fileBtn');
        this.fileInput = document.getElementById('fileInput');
        this.teacherPassword = document.getElementById('teacherPassword');
        this.teacherAuthPassword = document.getElementById('teacherAuthPassword');
        this.teacherName = document.getElementById('teacherName');
        this.teacherPassword = document.getElementById('teacherPassword');
        this.teacherClassCode = document.getElementById('teacherClassCode');
        this.joinPeerId = document.getElementById('joinPeerId');
        this.studentName = document.getElementById('studentName');
        this.studentPassword = document.getElementById('studentPassword');
        this.endCallBtn = document.getElementById('endCallBtn');
        this.lmsBtn = document.getElementById('lmsBtn');
        this.bookBtn = document.getElementById('bookBtn');
        this.replayBtn = document.getElementById('replayBtn');
        this.saveTeacherInfoBtn = document.getElementById('saveTeacherInfoBtn');
        this.loadTeacherInfoBtn = document.getElementById('loadTeacherInfoBtn');
        this.teacherInfoFileInput = document.getElementById('teacherInfoFileInput');
        this.toggleChatViewBtn = document.getElementById('toggleChatViewBtn');
        this.controlsBar = document.getElementById('controlsBar');

        // Containers
        this.chatContainer = document.getElementById('chatContainer');
        this.chatHeader = document.querySelector('.chat-header');
        this.remoteVideoWrapper = document.getElementById('remoteVideoWrapper');
        this.localVideoWrapper = document.getElementById('localVideoWrapper');
        this.mainLayout = document.getElementById('mainLayout');

        // Inputs
        this.chatInput = document.getElementById('chatInput');

        // Display elements
        this.myPeerIdDisplay = document.getElementById('myPeerId');
        this.invitationLinkDisplay = document.getElementById('invitationLink');
        this.copyInvitationBtn = document.getElementById('copyInvitationBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.chatMessages = document.getElementById('chatMessages');
        this.localVideo = document.getElementById('localVideo');
        this.remoteVideo = document.getElementById('remoteVideo');
        
        // Modal elements
        this.screenShareRequestModal = document.getElementById('screenShareRequestModal');
        this.requestMessage = document.getElementById('requestMessage');
        this.approveScreenShareBtn = document.getElementById('approveScreenShareBtn');
        this.rejectScreenShareBtn = document.getElementById('rejectScreenShareBtn');
        this.endCallModal = document.getElementById('endCallModal');
        this.saveChatAndEndBtn = document.getElementById('saveChatAndEndBtn');
        this.endWithoutSaveBtn = document.getElementById('endWithoutSaveBtn');
        this.cancelEndBtn = document.getElementById('cancelEndBtn');
        
        // Recording buttons
        this.recordBtn = document.getElementById('recordBtn');
        this.recordFolderBtn = document.getElementById('recordFolderBtn');
        
        // Drawing tools
        this.drawingTools = document.getElementById('drawingTools');
        this.drawColor = document.getElementById('drawColor');
        this.drawWidth = document.getElementById('drawWidth');
        this.widthValue = document.getElementById('widthValue');
        this.eraserBtn = document.getElementById('eraserBtn');
        this.clearDrawingBtn = document.getElementById('clearDrawingBtn');
        this.penBtn = document.getElementById('penBtn');
        this.pointerBtn = document.getElementById('pointerBtn');
        this.closeDrawingBtn = document.getElementById('closeDrawingBtn');
        this.drawingBtn = document.getElementById('drawingBtn');
        this.whiteboardBtn = document.getElementById('whiteboardBtn');
        this.screenShareDrawingBtn = document.getElementById('screenShareDrawingBtn');
    }

    attachEventListeners() {
        // Step 0: 교사/학생 선택
        if (this.selectTeacherBtn) {
            this.selectTeacherBtn.addEventListener('click', () => this.selectTeacher());
        }
        if (this.selectStudentBtn) {
            this.selectStudentBtn.addEventListener('click', () => this.selectStudent());
        }
        
        // 교사 인증
        if (this.teacherAuthBtn) this.teacherAuthBtn.addEventListener('click', () => this.authenticateTeacher());
        if (this.teacherAuthPassword) this.teacherAuthPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.authenticateTeacher();
        });
        if (this.backToSelectBtn) this.backToSelectBtn.addEventListener('click', () => this.showStep(0));
        if (this.backToSelectFromStudentBtn) this.backToSelectFromStudentBtn.addEventListener('click', () => this.showStep(0));
        
        if (this.createHostBtn) this.createHostBtn.addEventListener('click', () => this.createHost());
        if (this.joinBtn) this.joinBtn.addEventListener('click', () => this.joinPeer());
        if (this.copyBtn) this.copyBtn.addEventListener('click', () => this.copyPeerId());
        if (this.sendBtn) this.sendBtn.addEventListener('click', () => this.sendMessage());
        if (this.chatInput) this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        if (this.toggleVideoBtn) this.toggleVideoBtn.addEventListener('click', () => this.toggleVideo());
        if (this.toggleAudioBtn) this.toggleAudioBtn.addEventListener('click', () => this.toggleAudio());
        if (this.shareScreenBtn) this.shareScreenBtn.addEventListener('click', () => this.toggleScreenShare());
        if (this.toggleChatBtn) this.toggleChatBtn.addEventListener('click', () => this.toggleChat());
        if (this.closeChatBtn) this.closeChatBtn.addEventListener('click', () => this.toggleChat());
        if (this.downloadChatBtn) this.downloadChatBtn.addEventListener('click', () => this.downloadChatHistory());
        if (this.fullscreenBtn) this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen('remote'));
        if (this.localFullscreenBtn) this.localFullscreenBtn.addEventListener('click', () => this.toggleFullscreen('local'));
        this.remoteCaptureBtn = document.getElementById('remoteCaptureBtn');
        this.localCaptureBtn = document.getElementById('localCaptureBtn');
        this.switchCameraBtn = document.getElementById('switchCameraBtn');
        if (this.remoteCaptureBtn) this.remoteCaptureBtn.addEventListener('click', () => this.captureVideo('remote'));
        if (this.localCaptureBtn) this.localCaptureBtn.addEventListener('click', () => this.captureVideo('local'));
        if (this.switchCameraBtn) this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        this.closeDrawingBtn = document.getElementById('closeDrawingBtn');
        if (this.closeDrawingBtn) this.closeDrawingBtn.addEventListener('click', () => this.forceCloseDrawing());
        if (this.remotePipBtn) this.remotePipBtn.addEventListener('click', () => this.togglePIP('remote'));
        if (this.localPipBtn) this.localPipBtn.addEventListener('click', () => this.togglePIP('local'));
        if (this.remoteMaximizeBtn) this.remoteMaximizeBtn.addEventListener('click', () => this.toggleMaximize('remote'));
        if (this.localMaximizeBtn) this.localMaximizeBtn.addEventListener('click', () => this.toggleMaximize('local'));
        if (this.fullscreenChatBtn) this.fullscreenChatBtn.addEventListener('click', () => this.toggleChatFullscreen());
        if (this.popoutChatBtn) this.popoutChatBtn.addEventListener('click', () => this.popoutChat());
        if (this.fileBtn) this.fileBtn.addEventListener('click', () => this.fileInput.click());
        if (this.fileInput) this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        if (this.endCallBtn) this.endCallBtn.addEventListener('click', () => this.endCall());
        if (this.lmsBtn) this.lmsBtn.addEventListener('click', () => window.open('https://www.ezlive.kr/', '_blank'));
        if (this.bookBtn) this.bookBtn.addEventListener('click', () => window.open('https://ezlive.kr/Source/Book/index.php', '_blank'));
        if (this.replayBtn) this.replayBtn.addEventListener('click', () => window.open('https://jlive.co.kr/', '_blank'));
        if (this.saveTeacherInfoBtn) this.saveTeacherInfoBtn.addEventListener('click', () => this.saveTeacherInfoToFile());
        if (this.loadTeacherInfoBtn) this.loadTeacherInfoBtn.addEventListener('click', () => this.teacherInfoFileInput.click());
        if (this.teacherInfoFileInput) this.teacherInfoFileInput.addEventListener('change', (e) => this.loadTeacherInfoFromFile(e));
        if (this.toggleChatViewBtn) this.toggleChatViewBtn.addEventListener('click', () => this.toggleChatView());
        if (this.approveScreenShareBtn) this.approveScreenShareBtn.addEventListener('click', () => this.approveScreenShare());
        if (this.rejectScreenShareBtn) this.rejectScreenShareBtn.addEventListener('click', () => this.rejectScreenShare());
        if (this.saveChatAndEndBtn) this.saveChatAndEndBtn.addEventListener('click', () => this.saveChatAndEnd());
        if (this.endWithoutSaveBtn) this.endWithoutSaveBtn.addEventListener('click', () => this.endWithoutSave());
        if (this.cancelEndBtn) this.cancelEndBtn.addEventListener('click', () => this.cancelEnd());
        if (this.recordBtn) this.recordBtn.addEventListener('click', () => this.toggleRecording());
        if (this.recordFolderBtn) this.recordFolderBtn.addEventListener('click', () => this.openRecordFolder());
        if (this.copyInvitationBtn) this.copyInvitationBtn.addEventListener('click', () => this.copyInvitationLink());
        
        // Drawing tools
        if (this.drawWidth) this.drawWidth.addEventListener('input', (e) => {
            if (this.widthValue) this.widthValue.textContent = e.target.value;
        });
        if (this.eraserBtn) this.eraserBtn.addEventListener('click', () => this.activateEraser());
        if (this.penBtn) this.penBtn.addEventListener('click', () => this.activatePen());
        if (this.pointerBtn) this.pointerBtn.addEventListener('click', () => this.activatePointer());
        if (this.clearDrawingBtn) this.clearDrawingBtn.addEventListener('click', () => this.clearDrawing());
        if (this.closeDrawingBtn) this.closeDrawingBtn.addEventListener('click', () => this.closeDrawingTools());
        if (this.drawingBtn) this.drawingBtn.addEventListener('click', () => this.openDrawingWindow());
        if (this.whiteboardBtn) this.whiteboardBtn.addEventListener('click', () => this.toggleWhiteboard());
        if (this.screenShareDrawingBtn) this.screenShareDrawingBtn.addEventListener('click', () => this.toggleScreenShareDrawing());
    }

    // txt 파일로 교사 정보 저장
    saveTeacherInfoToFile() {
        const name = this.teacherName.value.trim();
        const password = this.teacherPassword.value.trim();
        const classCode = this.teacherClassCode.value.trim();
        
        if (!name || !password || !classCode) {
            alert('교사 이름, 비밀번호, 회의실 코드를 모두 입력해주세요.');
            return;
        }
        
        // txt 파일 내용 생성
        const content = `ezlive 로그인 정보\n` +
                       `==================\n` +
                       `교사 이름: ${name}\n` +
                       `회의실 비밀번호: ${password}\n` +
                       `회의실 코드: ${classCode}\n` +
                       `==================\n` +
                       `저장일시: ${new Date().toLocaleString('ko-KR')}`;
        
        // Blob 생성 및 다운로드
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ezlive_로그인정보_${classCode}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('로그인 정보가 txt 파일로 저장되었습니다.\n파일명: ezlive_로그인정보_' + classCode + '.txt');
    }
    
    // txt 파일에서 교사 정보 불러오기
    loadTeacherInfoFromFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const lines = content.split('\n');
                
                let name = '';
                let password = '';
                let classCode = '';
                
                // 파일 내용 파싱
                for (let line of lines) {
                    if (line.includes('교사 이름:')) {
                        name = line.split('교사 이름:')[1].trim();
                    } else if (line.includes('회의실 비밀번호:')) {
                        password = line.split('회의실 비밀번호:')[1].trim();
                    } else if (line.includes('회의실 코드:')) {
                        classCode = line.split('회의실 코드:')[1].trim();
                    }
                }
                
                if (!name || !password || !classCode) {
                    alert('올바른 로그인 정보 파일이 아닙니다.');
                    return;
                }
                
                // 입력란에 값 설정
                if (this.teacherName) this.teacherName.value = name;
                if (this.teacherPassword) this.teacherPassword.value = password;
                if (this.teacherClassCode) this.teacherClassCode.value = classCode;
                
                alert(`로그인 정보를 불러왔습니다!\n\n교사: ${name}\n회의실 코드: ${classCode}`);
                
            } catch (error) {
                console.error('파일 읽기 오류:', error);
                alert('파일을 읽는 중 오류가 발생했습니다.');
            }
            
            // input 파일 초기화 (같은 파일 재선택 가능하도록)
            event.target.value = '';
        };
        
        reader.onerror = () => {
            alert('파일을 읽을 수 없습니다.');
            event.target.value = '';
        };
        
        reader.readAsText(file, 'UTF-8');
    }
    
    // 회의실 생성 시 호출 (더 이상 자동 저장 안 함)
    saveTeacherInfo(name, password, classCode) {
        // 이 함수는 createHost에서 호출되지만 더 이상 localStorage에 저장하지 않음
        // txt 파일 저장은 사용자가 직접 "입력저장" 버튼을 눌러야 함
        console.log('회의실 생성됨:', name, classCode);
    }

    generateRandomClassCode() {
        // 랜덤 강의코드 생성 (8자리)
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    showStep(stepNumber) {
        [this.step0, this.stepTeacherAuth, this.step1, this.step2, this.step3].forEach(step => {
            if (step) step.classList.remove('active');
        });

        switch(stepNumber) {
            case 0:
                if (this.step0) this.step0.classList.add('active');
                if (this.controlsBar) this.controlsBar.style.display = 'none';
                break;
            case 0.5:
                if (this.stepTeacherAuth) this.stepTeacherAuth.classList.add('active');
                if (this.controlsBar) this.controlsBar.style.display = 'none';
                break;
            case 1:
                if (this.step1) this.step1.classList.add('active');
                if (this.controlsBar) this.controlsBar.style.display = 'none';
                break;
            case 2:
                if (this.step2) this.step2.classList.add('active');
                if (this.controlsBar) this.controlsBar.style.display = 'none';
                break;
            case 3:
                if (this.step3) this.step3.classList.add('active');
                if (this.controlsBar) this.controlsBar.style.display = 'flex';
                break;
        }
    }
    
    // 교사 선택
    selectTeacher() {
        this.showStep(0.5);
    }
    
    // 학생 선택
    selectStudent() {
        this.showStep(1);
        // 교사 카드 숨기고 학생 카드 표시
        if (this.teacherCard) this.teacherCard.style.display = 'none';
        if (this.studentCard) this.studentCard.style.display = 'block';
    }
    
    // 교사 인증
    authenticateTeacher() {
        const password = this.teacherAuthPassword.value.trim();
        const correctPassword = 'a123456!';
        
        if (password === correctPassword) {
            // 인증 성공
            this.showStep(1);
            // 학생 카드 숨기고 교사 카드 표시
            if (this.teacherCard) this.teacherCard.style.display = 'block';
            if (this.studentCard) this.studentCard.style.display = 'none';
            // 비밀번호 초기화
            this.teacherAuthPassword.value = '';
        } else {
            // 인증 실패
            alert('교사 비밀번호가 올바르지 않습니다.');
            this.teacherAuthPassword.value = '';
            this.teacherAuthPassword.focus();
        }
    }

    checkInvitationLink() {
        // URL에서 invitation-code 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const invitationCode = urlParams.get('invitation-code');
        
        if (invitationCode) {
            this.invitationCode = invitationCode;
            // step0 건너뛰고 바로 학생 입장 화면으로
            this.showStep(1);
            this.showStudentJoinUI();
        }
    }

    showStudentJoinUI() {
        // Step 1의 내용을 학생 전용으로 변경
        if (this.step1) {
            this.step1.innerHTML = `
                <div class="card">
                    <h2>🎓 강의 참여</h2>
                    <p>초대링크를 통해 접속하셨습니다.</p>
                    <p class="invitation-info">강의 코드: <strong>${this.invitationCode}</strong></p>
                    <input type="text" id="studentNameQuick" placeholder="학생 이름 입력" class="input">
                    <button id="joinQuickBtn" class="btn btn-primary">강의 참여</button>
                </div>
            `;
            
            // 새로운 요소들 참조
            const studentNameQuick = document.getElementById('studentNameQuick');
            const joinQuickBtn = document.getElementById('joinQuickBtn');
            
            if (joinQuickBtn) {
                joinQuickBtn.addEventListener('click', () => this.quickJoin());
            }
            
            if (studentNameQuick) {
                studentNameQuick.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.quickJoin();
                });
            }
        }
    }

    async quickJoin() {
        const studentNameQuick = document.getElementById('studentNameQuick');
        const name = studentNameQuick ? studentNameQuick.value.trim() : '';
        
        if (!name) {
            alert('학생 이름을 입력해주세요.');
            return;
        }
        
        if (!this.invitationCode) {
            alert('초대 코드가 없습니다.');
            return;
        }

        try {
            this.isHost = false;
            this.myName = name;

            // Create a new Peer
            this.peer = new Peer({
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            this.peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                this.connectToPeer(this.invitationCode);
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                alert('연결 오류가 발생했습니다: ' + err.message);
            });

            this.setupPeerListeners();

        } catch (error) {
            console.error('Error joining:', error);
            alert('참여 중 오류가 발생했습니다.');
        }
    }

    async createHost() {
        // 교사 이름 확인
        const name = this.teacherName.value.trim();
        if (!name) {
            alert('교사 이름을 입력해주세요.');
            return;
        }
        
        // 회의실 비밀번호 확인
        const password = this.teacherPassword.value.trim();
        if (!password) {
            alert('회의실 비밀번호를 입력해주세요.');
            return;
        }

        // 회의실 코드 확인
        let classCode = this.teacherClassCode.value.trim();
        if (!classCode) {
            alert('회의실 코드를 입력해주세요.');
            return;
        }
        
        // 비밀번호 저장 (나중에 학생 검증용)
        this.roomPassword = password;

        try {
            this.isHost = true;
            this.myName = name;
            
            // 고정된 PeerID로 생성 (강의 코드 사용)
            this.peer = new Peer(classCode, {
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            this.peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                this.myPeerIdDisplay.textContent = id;
                
                // 교사 정보 저장
                this.saveTeacherInfo(name, password, classCode);
                
                // 초대링크 생성 및 표시
                this.generateInvitationLink(id);
                
                this.showStep(2);
                this.setupPeerListeners();
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                
                // ID가 이미 사용 중인 경우
                if (err.type === 'unavailable-id') {
                    alert('❌ 이 강의 코드는 이미 사용 중입니다.\n다른 강의 코드를 입력해주세요.');
                    this.teacherClassCode.value = '';
                    this.teacherClassCode.focus();
                } else {
                    alert('연결 오류가 발생했습니다: ' + err.message);
                }
            });

        } catch (error) {
            console.error('Error creating host:', error);
            alert('호스트 생성 중 오류가 발생했습니다.');
        }
    }

    async joinPeer() {
        const name = this.studentName.value.trim();
        const remotePeerId = this.joinPeerId.value.trim();
        const password = this.studentPassword.value.trim();
        
        if (!name) {
            alert('학생 이름을 입력해주세요.');
            return;
        }
        
        if (!remotePeerId) {
            alert('회의실 코드를 입력해주세요.');
            return;
        }
        
        if (!password) {
            alert('회의실 비밀번호를 입력해주세요.');
            return;
        }
        
        // 비밀번호 저장 (접속 시 교사에게 전송하여 검증)
        this.studentRoomPassword = password;

        try {
            this.isHost = false;
            this.myName = name;

            // Create a new Peer
            this.peer = new Peer({
                config: {
                    iceServers: [
                        { urls: 'stun:stun.l.google.com:19302' },
                        { urls: 'stun:stun1.l.google.com:19302' }
                    ]
                }
            });

            this.peer.on('open', (id) => {
                console.log('My peer ID is: ' + id);
                this.setupPeerListeners();
                this.connectToPeer(remotePeerId);
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                alert('연결 오류가 발생했습니다: ' + err.message);
            });

        } catch (error) {
            console.error('Error joining peer:', error);
            alert('참여 중 오류가 발생했습니다.');
        }
    }

    setupPeerListeners() {
        // Listen for incoming connections
        this.peer.on('connection', (conn) => {
            console.log('Incoming connection from:', conn.peer);
            this.connection = conn;
            this.setupConnectionListeners();
            this.connectionStatus.textContent = '상대방이 연결되었습니다!';
            this.connectionStatus.parentElement.style.background = '#d4edda';
            this.connectionStatus.parentElement.style.borderColor = '#28a745';
            this.connectionStatus.style.color = '#155724';
        });

        // Listen for incoming calls
        this.peer.on('call', async (call) => {
            console.log('Incoming call from:', call.peer);
            
            // Get local stream
            await this.getLocalStream();
            
            // Answer the call with local stream
            call.answer(this.localStream);
            this.call = call;

            // Setup call listeners
            call.on('stream', (remoteStream) => {
                console.log('Received remote stream');
                this.remoteVideo.srcObject = remoteStream;
                this.playVideoSafely(this.remoteVideo, 'remote');
                this.showStep(3);
            });

            call.on('close', () => {
                console.log('Call ended');
                this.handleCallEnd();
            });

            call.on('error', (err) => {
                console.error('Call error:', err);
            });
        });
    }

    async connectToPeer(remotePeerId) {
        try {
            // Establish data connection
            this.connection = this.peer.connect(remotePeerId);
            this.setupConnectionListeners();

            // Get local stream
            await this.getLocalStream();

            // Make a call
            this.call = this.peer.call(remotePeerId, this.localStream);

            this.call.on('stream', (remoteStream) => {
                console.log('Received remote stream');
                this.remoteVideo.srcObject = remoteStream;
                this.showStep(3);
            });

            this.call.on('close', () => {
                console.log('Call ended');
                this.handleCallEnd();
            });

            this.call.on('error', (err) => {
                console.error('Call error:', err);
                alert('통화 연결 오류가 발생했습니다.');
            });

        } catch (error) {
            console.error('Error connecting to peer:', error);
            alert('상대방에게 연결할 수 없습니다.');
        }
    }

    setupConnectionListeners() {
        this.connection.on('open', () => {
            console.log('Data connection established');
            
            // 학생이면 비밀번호 전송
            if (!this.isHost && this.studentRoomPassword) {
                this.connection.send({
                    type: 'password',
                    password: this.studentRoomPassword,
                    name: this.myName
                });
            } else {
                // 교사는 바로 이름 전송
                this.connection.send({
                    type: 'name',
                    name: this.myName
                });
            }
        });

        this.connection.on('data', (data) => {
            console.log('Received data:', data);
            if (data.type === 'password') {
                // 교사가 학생의 비밀번호 검증
                if (this.isHost) {
                    if (data.password === this.roomPassword) {
                        // 비밀번호 맞음
                        this.connection.send({
                            type: 'passwordApproved',
                            message: '입장이 승인되었습니다.'
                        });
                        // 학생 이름 저장
                        this.remoteName = data.name;
                        this.updateVideoLabels();
                    } else {
                        // 비밀번호 틀림
                        this.connection.send({
                            type: 'passwordRejected',
                            message: '회의실 비밀번호가 올바르지 않습니다.'
                        });
                        setTimeout(() => {
                            this.connection.close();
                        }, 1000);
                    }
                }
            } else if (data.type === 'passwordApproved') {
                // 학생이 승인 받음
                console.log('Password approved');
                // 이름 교환
                this.connection.send({
                    type: 'name',
                    name: this.myName
                });
            } else if (data.type === 'passwordRejected') {
                // 학생이 거부됨
                alert(data.message);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else if (data.type === 'name') {
                // 상대방 이름 저장
                this.remoteName = data.name;
                this.updateVideoLabels();
            } else if (data.type === 'file') {
                this.receiveFile(data);
            } else if (data.type === 'message') {
                this.displayMessage(data.message, 'received', data.timestamp, data.senderName);
            } else if (data.type === 'recordingRequest') {
                // 녹화 요청 받음 (교사만)
                this.handleRecordingRequest(data);
            } else if (data.type === 'screenShareRequest') {
                // 화면공유 요청 받음 (교사만)
                this.handleScreenShareRequest(data);
            } else if (data.type === 'screenShareApproved') {
                // 화면공유 승인됨 (학생이 받음)
                this.handleScreenShareApproved();
            } else if (data.type === 'screenShareRejected') {
                // 화면공유 거부됨 (학생이 받음)
                this.handleScreenShareRejected();
            } else if (data.type === 'screenShareStarted') {
                // 상대방이 화면공유 시작
                const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                this.displayMessage(`${data.userName}님이 화면공유를 시작했습니다.`, 'system', timestamp);
            } else if (data.type === 'screenShareStopped') {
                // 상대방이 화면공유 종료
                const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                this.displayMessage(`${data.userName}님이 화면공유를 종료했습니다.`, 'system', timestamp);
            }
        });

        this.connection.on('close', () => {
            console.log('Connection closed');
        });

        this.connection.on('error', (err) => {
            console.error('Connection error:', err);
        });
    }

    async getLocalStream() {
        try {
            // 사용 가능한 카메라 목록 가져오기
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.videoDevices = devices.filter(device => device.kind === 'videoinput');
            this.currentVideoDeviceIndex = 0;
            
            // 카메라가 2개 이상이면 전환 버튼 표시
            if (this.videoDevices.length > 1 && this.switchCameraBtn) {
                this.switchCameraBtn.style.display = 'inline-block';
            }
            
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: this.currentVideoDeviceIndex === 0 ? true : {
                    deviceId: this.videoDevices[this.currentVideoDeviceIndex].deviceId
                },
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            this.playVideoSafely(this.localVideo, 'local');
            console.log('Got local stream');
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('카메라 또는 마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
            throw error;
        }
    }
    
    async switchCamera() {
        if (!this.videoDevices || this.videoDevices.length <= 1) {
            alert('사용 가능한 카메라가 하나뿐입니다.');
            return;
        }
        
        try {
            // 이전 인덱스 저장
            const previousIndex = this.currentVideoDeviceIndex;
            
            // 2개 카메라인 경우 토글, 3개 이상인 경우 순환
            if (this.videoDevices.length === 2) {
                // 2개 카메라: 0 ↔ 1 토글
                this.currentVideoDeviceIndex = this.currentVideoDeviceIndex === 0 ? 1 : 0;
            } else {
                // 3개 이상: 순환
                this.currentVideoDeviceIndex = (this.currentVideoDeviceIndex + 1) % this.videoDevices.length;
            }
            
            // 기존 비디오 트랙 중지
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.stop();
            }
            
            // 새 비디오 스트림 가져오기
            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    deviceId: this.videoDevices[this.currentVideoDeviceIndex].deviceId
                },
                audio: false
            });
            
            const newVideoTrack = newStream.getVideoTracks()[0];
            const audioTrack = this.localStream.getAudioTracks()[0];
            
            // 새 스트림 생성
            this.localStream = new MediaStream([newVideoTrack, audioTrack]);
            this.localVideo.srcObject = this.localStream;
            
            // 상대방에게 새 비디오 트랙 전송
            if (this.call && this.call.peerConnection) {
                const sender = this.call.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    sender.replaceTrack(newVideoTrack);
                }
            }
            
            const cameraName = this.videoDevices[this.currentVideoDeviceIndex].label || `카메라 ${this.currentVideoDeviceIndex + 1}`;
            console.log('Camera switched to:', cameraName);
            
            // 토스트 알림 (선택사항)
            if (this.videoDevices.length === 2) {
                console.log('카메라 토글: 다시 누르면 이전 카메라로 돌아갑니다.');
            }
            
        } catch (error) {
            console.error('Error switching camera:', error);
            alert('카메라 전환에 실패했습니다.');
        }
    }

    updateVideoLabels() {
        // 상대방 화면 레이블
        const remoteLabel = this.remoteVideoWrapper.querySelector('.video-label');
        if (remoteLabel && this.remoteName) {
            remoteLabel.textContent = this.remoteName;
        }
        
        // 내 화면 레이블
        const localLabel = this.localVideoWrapper.querySelector('.video-label');
        if (localLabel && this.myName) {
            localLabel.textContent = this.myName;
        }
    }

    copyPeerId() {
        const peerId = this.myPeerIdDisplay.textContent;
        navigator.clipboard.writeText(peerId).then(() => {
            this.copyBtn.textContent = '✅ 복사됨!';
            setTimeout(() => {
                this.copyBtn.textContent = '📋 코드 복사';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('복사에 실패했습니다.');
        });
    }

    generateInvitationLink(peerId) {
        // 현재 URL에 invitation-code 파라미터 추가
        const baseUrl = window.location.origin + window.location.pathname;
        const invitationLink = `${baseUrl}?invitation-code=${peerId}`;
        
        if (this.invitationLinkDisplay) {
            this.invitationLinkDisplay.textContent = invitationLink;
        }
    }

    copyInvitationLink() {
        const invitationLink = this.invitationLinkDisplay.textContent;
        navigator.clipboard.writeText(invitationLink).then(() => {
            this.copyInvitationBtn.textContent = '✅ 복사됨!';
            setTimeout(() => {
                this.copyInvitationBtn.textContent = '🔗 링크 복사';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('복사에 실패했습니다.');
        });
    }

    sendMessage() {
        const message = this.chatInput.value.trim();
        
        if (!message) return;
        
        if (!this.connection || !this.connection.open) {
            alert('상대방과 연결되지 않았습니다.');
            return;
        }

        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        // Send message
        this.connection.send({
            type: 'message',
            message: message,
            timestamp: timestamp,
            senderName: this.myName
        });

        // Display sent message
        this.displayMessage(message, 'sent', timestamp, this.myName);

        // Clear input
        this.chatInput.value = '';
    }

    displayMessage(message, type, timestamp, senderName = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        
        // 이름 표시 (있는 경우)
        if (senderName) {
            const nameDiv = document.createElement('div');
            nameDiv.className = 'message-sender';
            nameDiv.textContent = senderName;
            nameDiv.style.fontSize = '0.75rem';
            nameDiv.style.fontWeight = '600';
            nameDiv.style.marginBottom = '4px';
            nameDiv.style.opacity = '0.8';
            messageDiv.appendChild(nameDiv);
        }
        
        const messageText = document.createElement('div');
        messageText.textContent = message;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = timestamp;
        
        messageDiv.appendChild(messageText);
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Sync to popup if open
        this.syncMessagesToPopup();

        // Save to chat history
        this.chatHistory.push({
            type: type,
            message: message,
            timestamp: timestamp,
            senderName: senderName,
            fullTimestamp: new Date().toISOString()
        });
    }

    toggleChatView() {
        if (!this.chatContainer || !this.toggleChatViewBtn) return;
        
        this.isChatVisible = !this.isChatVisible;
        
        if (this.isChatVisible) {
            this.chatContainer.style.display = 'flex';
            this.toggleChatViewBtn.classList.remove('off');
        } else {
            this.chatContainer.style.display = 'none';
            this.toggleChatViewBtn.classList.add('off');
        }
    }

    toggleVideo() {
        if (!this.localStream) return;

        this.isVideoEnabled = !this.isVideoEnabled;
        
        this.localStream.getVideoTracks().forEach(track => {
            track.enabled = this.isVideoEnabled;
        });

        if (this.isVideoEnabled) {
            this.toggleVideoBtn.innerHTML = '<span class="icon">📹</span>';
            this.toggleVideoBtn.classList.remove('off');
        } else {
            this.toggleVideoBtn.innerHTML = '<span class="icon">📹</span>';
            this.toggleVideoBtn.classList.add('off');
        }
    }

    toggleAudio() {
        if (!this.localStream) return;

        this.isAudioEnabled = !this.isAudioEnabled;
        
        this.localStream.getAudioTracks().forEach(track => {
            track.enabled = this.isAudioEnabled;
        });

        if (this.isAudioEnabled) {
            this.toggleAudioBtn.innerHTML = '<span class="icon">🎤</span>';
            this.toggleAudioBtn.classList.remove('off');
        } else {
            this.toggleAudioBtn.innerHTML = '<span class="icon">🎤</span>';
            this.toggleAudioBtn.classList.add('off');
        }
    }

    async toggleScreenShare() {
        if (this.isScreenSharing) {
            await this.stopScreenShare();
        } else {
            // 학생이면 교사에게 승인 요청
            if (!this.isHost) {
                this.requestScreenShare();
            } else {
                // 교사는 바로 화면공유
                await this.startScreenShare();
            }
        }
    }

    async startScreenShare() {
        try {
            // 모바일 감지
            const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
            
            if (!navigator.mediaDevices.getDisplayMedia) {
                if (isMobile) {
                    alert('이 모바일 브라우저는 화면 공유를 지원하지 않습니다.\nChrome 또는 Safari 최신 버전을 사용해주세요.');
                } else {
                    alert('화면 공유는 이 브라우저에서 지원되지 않습니다.');
                }
                return;
            }

            // 모바일과 데스크톱에서 모두 작동
            // 시스템 오디오 캡처 요청
            const displayMediaOptions = {
                video: {
                    cursor: isMobile ? undefined : 'always',
                    displaySurface: isMobile ? undefined : 'monitor'
                },
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    sampleRate: 44100,
                    suppressLocalAudioPlayback: false
                }
            };
            
            this.screenStream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);

            this.originalStream = this.localStream;
            const micAudioTrack = this.originalStream.getAudioTracks()[0]; // 마이크 오디오
            const screenVideoTrack = this.screenStream.getVideoTracks()[0]; // 화면 비디오
            const screenAudioTrack = this.screenStream.getAudioTracks()[0]; // 화면 오디오 (시스템 사운드)
            
            // 시스템 오디오 우선, 없으면 마이크 오디오 사용
            const tracks = [screenVideoTrack];
            
            if (screenAudioTrack) {
                // 시스템 오디오가 있는 경우
                console.log('시스템 오디오 캡처 성공');
                tracks.push(screenAudioTrack);
                
                // 마이크도 함께 전송하려면 AudioContext로 믹싱 필요
                // 여기서는 시스템 오디오만 전송
            } else if (micAudioTrack) {
                // 시스템 오디오가 없으면 마이크만
                console.log('시스템 오디오 없음, 마이크 오디오 사용');
                tracks.push(micAudioTrack);
            }
            
            this.localStream = new MediaStream(tracks);

            this.localVideo.srcObject = this.localStream;

            if (this.call && this.call.peerConnection) {
                // 비디오 트랙 교체
                const videoSender = this.call.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (videoSender && screenVideoTrack) {
                    videoSender.replaceTrack(screenVideoTrack);
                }
                
                // 오디오 트랙 교체
                const audioSender = this.call.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'audio'
                );
                
                if (audioSender) {
                    if (screenAudioTrack) {
                        // 시스템 오디오로 교체
                        console.log('시스템 오디오 트랙으로 교체');
                        audioSender.replaceTrack(screenAudioTrack);
                    } else if (micAudioTrack) {
                        // 마이크 오디오 유지
                        console.log('마이크 오디오 유지');
                        // 이미 마이크가 전송 중이므로 교체 불필요
                    }
                }
            }

            this.isScreenSharing = true;
            this.shareScreenBtn.innerHTML = '<span class="icon">⏹️</span><span class="label">공유중지</span>';
            this.shareScreenBtn.classList.add('sharing');

            // 채팅에 화면공유 시작 알림
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.displayMessage(`화면공유를 시작했습니다.`, 'system', timestamp);
            
            // 상대방에게도 알림 전송
            if (this.connection && this.connection.open) {
                this.connection.send({
                    type: 'screenShareStarted',
                    userName: this.myName
                });
            }

            // 채팅창에 화면공유용 판서 버튼 표시
            if (this.screenShareDrawingBtn) {
                this.screenShareDrawingBtn.style.display = 'inline-block';
            }

            screenVideoTrack.onended = () => {
                this.stopScreenShare();
            };

        } catch (error) {
            console.error('Error starting screen share:', error);
            if (error.name === 'NotAllowedError') {
                alert('화면 공유 권한이 거부되었습니다.');
            } else {
                alert('화면 공유를 시작할 수 없습니다.');
            }
        }
    }

    async stopScreenShare() {
        if (!this.isScreenSharing) return;

        try {
            if (this.screenStream) {
                this.screenStream.getTracks().forEach(track => track.stop());
            }

            if (this.originalStream) {
                this.localStream = this.originalStream;
                this.localVideo.srcObject = this.localStream;

                if (this.call && this.call.peerConnection) {
                    // 원래 비디오 트랙으로 복원
                    const videoTrack = this.originalStream.getVideoTracks()[0];
                    const videoSender = this.call.peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (videoSender && videoTrack) {
                        videoSender.replaceTrack(videoTrack);
                    }
                    
                    // 원래 오디오 트랙으로 복원
                    const audioTrack = this.originalStream.getAudioTracks()[0];
                    const audioSender = this.call.peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'audio'
                    );
                    if (audioSender && audioTrack) {
                        audioSender.replaceTrack(audioTrack);
                    }
                }
            }

            this.isScreenSharing = false;
            this.shareScreenBtn.innerHTML = '<span class="icon">🖥️</span><span class="label">화면공유</span>';
            this.shareScreenBtn.classList.remove('sharing');

            this.screenStream = null;
            this.originalStream = null;
            
            // 채팅에 화면공유 종료 알림
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.displayMessage(`화면공유를 종료했습니다.`, 'system', timestamp);
            
            // 상대방에게도 알림 전송
            if (this.connection && this.connection.open) {
                this.connection.send({
                    type: 'screenShareStopped',
                    userName: this.myName
                });
            }
            
            // 화면공유용 판서 도구 정리
            if (this.isScreenShareDrawing) {
                this.closeScreenShareDrawing();
            }
            
            // 판서 캔버스 완전히 제거 (내용이 남아있지 않도록)
            if (this.screenShareDrawingCanvas) {
                // 캔버스 내용 지우기
                if (this.screenShareDrawingContext) {
                    this.screenShareDrawingContext.clearRect(0, 0, this.screenShareDrawingCanvas.width, this.screenShareDrawingCanvas.height);
                }
                // 캔버스 DOM에서 제거
                if (this.screenShareDrawingCanvas.parentNode) {
                    this.screenShareDrawingCanvas.parentNode.removeChild(this.screenShareDrawingCanvas);
                }
                this.screenShareDrawingCanvas = null;
                this.screenShareDrawingContext = null;
            }
            
            // 포인터 제거
            if (this.pointerElement && this.pointerElement.parentNode) {
                this.pointerElement.parentNode.removeChild(this.pointerElement);
                this.pointerElement = null;
            }
            
            // 채팅창의 판서 버튼 숨기기
            if (this.screenShareDrawingBtn) {
                this.screenShareDrawingBtn.style.display = 'none';
            }
            
            // 종료 버튼 숨기기
            if (this.closeDrawingBtn) {
                this.closeDrawingBtn.style.display = 'none';
            }
            
            if (this.drawingWindow && !this.drawingWindow.closed) {
                this.drawingWindow.close();
                this.drawingWindow = null;
            }

        } catch (error) {
            console.error('Error stopping screen share:', error);
        }
    }

    requestScreenShare() {
        if (!this.connection || !this.connection.open) {
            alert('교사와 연결되지 않았습니다.');
            return;
        }

        // 교사에게 화면공유 요청 전송
        this.connection.send({
            type: 'screenShareRequest',
            requesterName: this.myName
        });

        alert(`${this.remoteName || '교사'}님에게 화면공유 요청을 보냈습니다. 승인을 기다려주세요.`);
    }

    handleRecordingRequest(data) {
        // 교사만 이 함수 실행
        if (!this.isHost) return;

        const approved = confirm(`${data.studentName}님이 녹화를 요청했습니다.\n\n녹화를 승인하시겠습니까?`);
        
        if (approved) {
            // 학생에게 승인 메시지 전송
            if (this.connection && this.connection.open) {
                this.connection.send({
                    type: 'recordingApproved'
                });
            }
            
            // 채팅에 알림
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.displayMessage(`${data.studentName}님의 녹화를 승인했습니다.`, 'system', timestamp);
        } else {
            // 학생에게 거부 메시지 전송
            if (this.connection && this.connection.open) {
                this.connection.send({
                    type: 'recordingRejected'
                });
            }
            
            // 채팅에 알림
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.displayMessage(`${data.studentName}님의 녹화를 거부했습니다.`, 'system', timestamp);
        }
    }

    handleScreenShareRequest(data) {
        // 교사만 이 함수 실행
        if (!this.isHost) return;

        // 요청자 정보 저장
        this.pendingScreenShareRequest = data;

        // 모달 표시
        if (this.requestMessage) {
            this.requestMessage.textContent = `${data.requesterName || '학생'}님이 화면공유를 요청했습니다.`;
        }
        
        if (this.screenShareRequestModal) {
            this.screenShareRequestModal.style.display = 'flex';
        }
    }

    approveScreenShare() {
        if (!this.pendingScreenShareRequest) return;

        // 학생에게 승인 메시지 전송
        if (this.connection && this.connection.open) {
            this.connection.send({
                type: 'screenShareApproved'
            });
        }

        // 모달 닫기
        if (this.screenShareRequestModal) {
            this.screenShareRequestModal.style.display = 'none';
        }

        this.pendingScreenShareRequest = null;
        
        // 채팅에 알림 메시지
        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.displayMessage(`${this.remoteName}님의 화면공유를 승인했습니다.`, 'system', timestamp);
    }

    rejectScreenShare() {
        if (!this.pendingScreenShareRequest) return;

        // 학생에게 거부 메시지 전송
        if (this.connection && this.connection.open) {
            this.connection.send({
                type: 'screenShareRejected'
            });
        }

        // 모달 닫기
        if (this.screenShareRequestModal) {
            this.screenShareRequestModal.style.display = 'none';
        }

        this.pendingScreenShareRequest = null;
        
        // 채팅에 알림 메시지
        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        this.displayMessage(`${this.remoteName}님의 화면공유 요청을 거부했습니다.`, 'system', timestamp);
    }

    async handleScreenShareApproved() {
        // 학생이 승인 받았을 때
        alert('교사가 화면공유를 승인했습니다. 화면을 선택해주세요.');
        await this.startScreenShare();
    }

    handleScreenShareRejected() {
        // 학생이 거부 당했을 때
        alert('교사가 화면공유 요청을 거부했습니다.');
    }

    toggleChat() {
        this.chatContainer.classList.toggle('active');
    }

    setupMobileChat() {
        // 모바일 환경 감지
        const isMobile = /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
        
        if (isMobile && this.chatHeader) {
            // 채팅 헤더 클릭으로 토글
            this.chatHeader.addEventListener('click', () => {
                this.toggleChat();
            });
        }
    }

    // 비디오 안전 재생 (모바일 자동재생 정책 처리)
    async playVideoSafely(videoElement, label = '') {
        try {
            await videoElement.play();
            console.log(`${label} video playing successfully`);
        } catch (error) {
            console.warn(`${label} video autoplay failed:`, error);
            // 모바일에서는 사용자 제스처가 필요할 수 있음
            if (error.name === 'NotAllowedError') {
                // 사용자에게 탭하여 재생하도록 안내
                const playButton = document.createElement('button');
                playButton.textContent = '▶ 비디오 재생';
                playButton.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 15px 30px;
                    background: #4CAF50;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 1.2rem;
                    cursor: pointer;
                    z-index: 100;
                `;
                
                playButton.addEventListener('click', async () => {
                    try {
                        await videoElement.play();
                        playButton.remove();
                    } catch (err) {
                        console.error('Manual play failed:', err);
                    }
                });
                
                videoElement.parentElement.style.position = 'relative';
                videoElement.parentElement.appendChild(playButton);
            }
        }
    }

    async toggleRecording() {
        if (this.isRecording) {
            // 녹화 중지
            this.stopRecording();
        } else {
            // 녹화 시작
            await this.startRecording();
        }
    }

    async startRecording() {
        try {
            // 학생이면 교사에게 승인 요청
            if (!this.isHost) {
                const approved = await this.requestRecordingPermission();
                if (!approved) {
                    return;
                }
            }
            
            // 모바일 감지
            const isMobile = /android|iphone|ipad|ipod/i.test(navigator.userAgent);
            
            // 화면 + 오디오 캡처 (모바일과 데스크톱 모두 지원)
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: isMobile ? undefined : 'always',
                    displaySurface: isMobile ? undefined : 'monitor'
                },
                audio: isMobile ? true : false // 모바일에서는 시스템 오디오도 캡처 시도
            });

            // 마이크 오디오 가져오기
            let audioStream = null;
            try {
                audioStream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false
                });
            } catch (err) {
                console.log('오디오 캡처 실패, 비디오만 녹화합니다.');
            }

            // 스트림 합치기
            const tracks = [...displayStream.getVideoTracks()];
            if (audioStream) {
                tracks.push(...audioStream.getAudioTracks());
            }
            const combinedStream = new MediaStream(tracks);

            // MediaRecorder 설정
            const options = {
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 2500000
            };

            // 지원 여부 확인
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options.mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options.mimeType = 'video/webm';
                }
            }

            this.mediaRecorder = new MediaRecorder(combinedStream, options);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.saveRecording();
                // 스트림 정리
                displayStream.getTracks().forEach(track => track.stop());
                if (audioStream) {
                    audioStream.getTracks().forEach(track => track.stop());
                }
            };

            // 녹화 시작
            this.mediaRecorder.start(1000); // 1초마다 데이터 수집
            this.isRecording = true;

            // 버튼 스타일 변경
            if (this.recordBtn) {
                this.recordBtn.innerHTML = '<span class="icon">⏹️</span><span class="label">중지</span>';
                this.recordBtn.classList.add('recording');
            }

            // 채팅에 알림
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.displayMessage(`녹화를 시작했습니다.`, 'system', timestamp);

            // 화면 공유가 중지되면 자동으로 녹화도 중지
            displayStream.getVideoTracks()[0].onended = () => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            };

        } catch (error) {
            console.error('녹화 시작 오류:', error);
            if (error.name === 'NotAllowedError') {
                alert('화면 캡처 권한이 거부되었습니다.');
            } else {
                alert('녹화를 시작할 수 없습니다.');
            }
        }
    }

    // 녹화 승인 요청 (학생용)
    requestRecordingPermission() {
        return new Promise((resolve) => {
            if (!this.connection) {
                alert('교사와 연결되지 않았습니다.');
                resolve(false);
                return;
            }
            
            // 승인 응답 대기
            const handleResponse = (data) => {
                if (data.type === 'recordingApproved') {
                    alert('교사가 녹화를 승인했습니다.');
                    this.connection.off('data', handleResponse);
                    resolve(true);
                } else if (data.type === 'recordingRejected') {
                    alert('교사가 녹화를 거부했습니다.');
                    this.connection.off('data', handleResponse);
                    resolve(false);
                }
            };
            
            this.connection.on('data', handleResponse);
            
            // 교사에게 녹화 승인 요청 전송
            this.connection.send({
                type: 'recordingRequest',
                studentName: this.myName
            });
            
            alert('교사에게 녹화 승인을 요청했습니다.\n잠시만 기다려주세요.');
        });
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;

            // 버튼 스타일 원래대로
            if (this.recordBtn) {
                this.recordBtn.innerHTML = '<span class="icon">⏺️</span><span class="label">녹화</span>';
                this.recordBtn.classList.remove('recording');
            }

            // 채팅에 알림
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.displayMessage(`녹화를 중지했습니다. 파일을 다운로드합니다.`, 'system', timestamp);
        }
    }

    // 비디오 화면 캡쳐 (PNG로 저장)
    captureVideo(type) {
        const video = type === 'remote' ? this.remoteVideo : this.localVideo;
        const label = type === 'remote' ? '상대방' : '내';
        
        if (!video || !video.srcObject) {
            alert(`${label} 화면을 캡쳐할 수 없습니다.`);
            return;
        }
        
        try {
            // 캔버스 생성
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            // 비디오 프레임을 캔버스에 그리기
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // PNG로 변환 및 다운로드
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                
                // 파일명 생성
                const now = new Date();
                const filename = `ezlive_capture_${type}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}.png`;
                
                a.href = url;
                a.download = filename;
                a.click();
                
                URL.revokeObjectURL(url);
                
                // 채팅에 알림
                const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                this.displayMessage(`${label} 화면을 캡쳐했습니다. (${filename})`, 'system', timestamp);
            }, 'image/png');
            
        } catch (error) {
            console.error('화면 캡쳐 오류:', error);
            alert('화면 캡쳐에 실패했습니다.');
        }
    }

    saveRecording() {
        if (this.recordedChunks.length === 0) {
            alert('녹화된 내용이 없습니다.');
            return;
        }

        // Blob 생성
        const blob = new Blob(this.recordedChunks, {
            type: 'video/webm'
        });

        // 다운로드 링크 생성
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        
        // 파일명 생성 (날짜_시간.webm)
        const now = new Date();
        const filename = `ezlive_recording_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}.webm`;
        a.download = filename;

        document.body.appendChild(a);
        a.click();

        // 정리
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        this.recordedChunks = [];
    }

    openRecordFolder() {
        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Chrome에서 다운로드 폴더 열기 시도
        if (window.chrome && chrome.downloads) {
            chrome.downloads.showDefaultFolder();
            this.displayMessage(`다운로드 폴더를 열었습니다.`, 'system', timestamp);
            return;
        }
        
        // 다른 브라우저는 안내 메시지 표시
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const isWindows = navigator.platform.toUpperCase().indexOf('WIN') >= 0;
        
        let message = '📁 녹화 파일 저장 위치\n\n';
        message += '녹화 파일은 브라우저 기본 다운로드 폴더에 저장됩니다.\n\n';
        
        if (isMac) {
            message += '🍎 Mac:\n';
            message += '1. Finder 열기\n';
            message += '2. "다운로드" 폴더 클릭\n';
            message += '3. 또는 Cmd + Option + L 단축키\n';
            message += '4. 경로: ~/Downloads/\n\n';
            message += '🔍 파일명: ezlive_recording_날짜_시간.webm';
        } else if (isWindows) {
            message += '💻 Windows:\n';
            message += '1. 파일 탐색기 열기 (Win + E)\n';
            message += '2. "다운로드" 폴더 클릭\n';
            message += '3. 또는 주소창에 입력: shell:downloads\n';
            message += '4. 경로: C:\\Users\\사용자명\\Downloads\\\n\n';
            message += '🔍 파일명: ezlive_recording_날짜_시간.webm';
        } else {
            message += '📂 일반적인 다운로드 폴더:\n';
            message += '- 브라우저 설정에서 다운로드 폴더 확인\n';
            message += '- 파일 관리자에서 "다운로드" 폴더 찾기\n\n';
            message += '🔍 파일명: ezlive_recording_날짜_시간.webm';
        }
        
        alert(message);
        this.displayMessage(`다운로드 폴더 안내를 표시했습니다.`, 'system', timestamp);
    }

    toggleFullscreen(target) {
        if (!this.isFullscreen) {
            // 전체화면 진입
            const wrapper = target === 'remote' ? this.remoteVideoWrapper : this.localVideoWrapper;
            const btn = target === 'remote' ? this.fullscreenBtn : this.localFullscreenBtn;
            
            wrapper.classList.add('fullscreen');
            btn.innerHTML = '<span class="icon">⊎</span>';
            btn.classList.add('active');
            btn.title = '전체화면 나가기';
            
            this.isFullscreen = true;
            this.fullscreenTarget = target;

            // 모바일 감지
            const isMobile = window.innerWidth <= 768;
            
            if (isMobile) {
                // 모바일: 채팅창을 하단에 슬라이드업
                this.chatContainer.classList.add('fullscreen-side');
                this.chatContainer.classList.remove('active');
            } else {
                // 데스크톱: 채팅창을 오른쪽에 고정
                this.chatContainer.classList.add('fullscreen-side');
            }

            document.addEventListener('keydown', this.handleFullscreenEsc);
        } else {
            this.exitFullscreen();
        }
    }

    exitFullscreen = () => {
        if (!this.isFullscreen) return;

        const wrapper = this.fullscreenTarget === 'remote' ? this.remoteVideoWrapper : this.localVideoWrapper;
        const btn = this.fullscreenTarget === 'remote' ? this.fullscreenBtn : this.localFullscreenBtn;
        
        wrapper.classList.remove('fullscreen');
        btn.innerHTML = '<span class="icon">⛶️</span>';
        btn.classList.remove('active');
        btn.title = '전체화면';
        
        this.isFullscreen = false;
        this.fullscreenTarget = null;
        
        // 채팅창 원래대로
        this.chatContainer.classList.remove('fullscreen-side');
        
        document.removeEventListener('keydown', this.handleFullscreenEsc);
    }

    handleFullscreenEsc = (e) => {
        if (e.key === 'Escape' && this.isFullscreen) {
            this.exitFullscreen();
        }
    }

    async togglePIP(type) {
        const video = type === 'remote' ? this.remoteVideo : this.localVideo;
        const btn = type === 'remote' ? this.remotePipBtn : this.localPipBtn;
        
        if (!video || !btn) return;
        
        if (!document.pictureInPictureElement) {
            try {
                await video.requestPictureInPicture();
                btn.classList.add('active');
                
                video.addEventListener('leavepictureinpicture', () => {
                    btn.classList.remove('active');
                }, { once: true });
            } catch (error) {
                console.error('PIP 오류:', error);
                alert('PIP 모드를 지원하지 않는 브라우저입니다.');
            }
        } else {
            try {
                await document.exitPictureInPicture();
                btn.classList.remove('active');
            } catch (error) {
                console.error('PIP 종료 오류:', error);
            }
        }
    }

    toggleMaximize(type) {
        const wrapper = type === 'remote' ? this.remoteVideoWrapper : this.localVideoWrapper;
        const btn = type === 'remote' ? this.remoteMaximizeBtn : this.localMaximizeBtn;
        
        if (!wrapper || !btn) return;
        
        // 전체화면 모드에서는 최대화/최소화 불가
        if (wrapper.classList.contains('fullscreen')) {
            return;
        }
        
        if (wrapper.classList.contains('maximized')) {
            // 최대화 해제
            wrapper.classList.remove('maximized');
            btn.innerHTML = '<span class="icon">⤢</span>';
            btn.classList.remove('active');
            btn.title = '최대화';
        } else {
            // 최대화
            wrapper.classList.add('maximized');
            btn.innerHTML = '<span class="icon">⤡</span>';
            btn.classList.add('active');
            btn.title = '최소화';
        }
    }



    toggleChatFullscreen() {
        if (!this.chatContainer || !this.fullscreenChatBtn) return;
        
        if (!this.isChatFullscreen) {
            this.chatContainer.classList.add('fullscreen-mode');
            this.fullscreenChatBtn.innerHTML = '⊎';
            this.fullscreenChatBtn.title = '전체화면 나가기';
            this.fullscreenChatBtn.classList.add('active');
            this.isChatFullscreen = true;
            
            document.addEventListener('keydown', this.handleChatFullscreenEsc);
        } else {
            this.exitChatFullscreen();
        }
    }

    exitChatFullscreen = () => {
        if (!this.chatContainer || !this.fullscreenChatBtn) return;
        
        this.chatContainer.classList.remove('fullscreen-mode');
        this.fullscreenChatBtn.innerHTML = '⛶️';
        this.fullscreenChatBtn.title = '채팅 전체화면';
        this.fullscreenChatBtn.classList.remove('active');
        this.isChatFullscreen = false;
        document.removeEventListener('keydown', this.handleChatFullscreenEsc);
    }

    handleChatFullscreenEsc = (e) => {
        if (e.key === 'Escape' && this.isChatFullscreen) {
            this.exitChatFullscreen();
        }
    }

    downloadChatHistory() {
        if (this.chatHistory.length === 0) {
            alert('다운로드할 채팅 기록이 없습니다.');
            return;
        }

        let csvContent = '\ufeff';
        csvContent += '시간,보낸사람,메시지\n';

        this.chatHistory.forEach(item => {
            const sender = item.type === 'sent' ? '나' : '상대방';
            const message = item.message.replace(/"/g, '""');
            const timestamp = item.timestamp;
            csvContent += `"${timestamp}","${sender}","${message}"\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        const now = new Date();
        const filename = `ezlive_chat_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        const originalText = this.downloadChatBtn.innerHTML;
        this.downloadChatBtn.innerHTML = '<span class="icon">✅</span>';
        setTimeout(() => {
            this.downloadChatBtn.innerHTML = originalText;
        }, 2000);
    }

    setupChatSync() {
        window.addEventListener('message', (event) => {
            if (event.data.type === 'chat-message') {
                this.sendMessageFromPopup(event.data.message);
            }
        });
    }

    popoutChat() {
        if (this.chatWindow && !this.chatWindow.closed) {
            this.chatWindow.focus();
            return;
        }

        const width = 400;
        const height = 600;
        const left = window.screenX + window.outerWidth - width - 20;
        const top = window.screenY + 100;

        this.chatWindow = window.open('', 'ezlive-chat', `width=${width},height=${height},left=${left},top=${top}`);
        
        if (!this.chatWindow) {
            alert('팝업 창이 차단되었습니다. 팝업 차단을 해제해주세요.');
            return;
        }

        this.chatWindow.document.write(`
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ezlive - 채팅</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                        background: #f9f9f9;
                    }
                    .header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 20px;
                        font-size: 1.2rem;
                        font-weight: 600;
                    }
                    .chat-messages {
                        flex: 1;
                        overflow-y: auto;
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }
                    .message {
                        padding: 12px 15px;
                        border-radius: 10px;
                        max-width: 70%;
                        word-wrap: break-word;
                    }
                    .message.sent {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        margin-left: auto;
                        text-align: right;
                    }
                    .message.received {
                        background: #e3e3e3;
                        color: #333;
                        margin-right: auto;
                    }
                    .message-time {
                        font-size: 0.75rem;
                        opacity: 0.7;
                        margin-top: 5px;
                    }
                    .input-container {
                        display: flex;
                        padding: 15px;
                        background: white;
                        border-top: 1px solid #ddd;
                    }
                    .input {
                        flex: 1;
                        padding: 12px 15px;
                        font-size: 1rem;
                        border: 2px solid #ddd;
                        border-radius: 8px 0 0 8px;
                    }
                    .input:focus {
                        outline: none;
                        border-color: #667eea;
                    }
                    .btn {
                        padding: 12px 25px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        border: none;
                        border-radius: 0 8px 8px 0;
                        cursor: pointer;
                        font-weight: 600;
                    }
                    .btn:hover {
                        opacity: 0.9;
                    }
                    .chat-messages::-webkit-scrollbar { width: 8px; }
                    .chat-messages::-webkit-scrollbar-track { background: #f1f1f1; }
                    .chat-messages::-webkit-scrollbar-thumb { background: #888; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="header">💬 ezlive 채팅</div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="input-container">
                    <input type="text" id="chatInput" class="input" placeholder="메시지를 입력하세요...">
                    <button id="sendBtn" class="btn">전송</button>
                </div>
                <script>
                    const chatMessages = document.getElementById('chatMessages');
                    const chatInput = document.getElementById('chatInput');
                    const sendBtn = document.getElementById('sendBtn');

                    function sendMessage() {
                        const message = chatInput.value.trim();
                        if (!message) return;
                        
                        window.opener.postMessage({ type: 'chat-message', message: message }, '*');
                        chatInput.value = '';
                    }

                    sendBtn.addEventListener('click', sendMessage);
                    chatInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') sendMessage();
                    });

                    chatInput.focus();
                </script>
            </body>
            </html>
        `);
        this.chatWindow.document.close();

        setTimeout(() => {
            this.syncMessagesToPopup();
        }, 100);

        this.chatContainer.style.display = 'none';

        const checkClosed = setInterval(() => {
            if (this.chatWindow.closed) {
                clearInterval(checkClosed);
                this.chatContainer.style.display = 'flex';
                this.chatWindow = null;
            }
        }, 500);
    }

    syncMessagesToPopup() {
        if (!this.chatWindow || this.chatWindow.closed) return;

        const popupMessages = this.chatWindow.document.getElementById('chatMessages');
        if (!popupMessages) return;

        popupMessages.innerHTML = this.chatMessages.innerHTML;
        popupMessages.scrollTop = popupMessages.scrollHeight;
    }

    sendMessageFromPopup(message) {
        if (!this.connection || !this.connection.open) {
            alert('상대방과 연결되지 않았습니다.');
            return;
        }

        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        this.connection.send({
            message: message,
            timestamp: timestamp
        });

        this.displayMessage(message, 'sent', timestamp);
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 파일 크기 제한 (100MB)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('파일 크기는 100MB를 초과할 수 없습니다.');
            return;
        }

        if (!this.connection || !this.connection.open) {
            alert('상대방과 연결되지 않았습니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });

            const fileData = {
                type: 'file',
                name: file.name,
                size: file.size,
                data: e.target.result,
                mimeType: file.type,
                timestamp: timestamp,
                senderName: this.myName
            };

            // 전송
            this.connection.send(fileData);

            // 내 화면에 표시
            this.displayFileMessage(file.name, file.size, e.target.result, file.type, 'sent', timestamp, this.myName);
        };

        reader.readAsDataURL(file);
        event.target.value = ''; // 리셋
    }

    receiveFile(data) {
        this.displayFileMessage(data.name, data.size, data.data, data.mimeType, 'received', data.timestamp, data.senderName);
    }

    displayFileMessage(fileName, fileSize, fileData, mimeType, type, timestamp, senderName = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type} file`;
        
        // 이름 표시 (있는 경우)
        if (senderName) {
            const nameDiv = document.createElement('div');
            nameDiv.className = 'message-sender';
            nameDiv.textContent = senderName;
            nameDiv.style.fontSize = '0.75rem';
            nameDiv.style.fontWeight = '600';
            nameDiv.style.marginBottom = '4px';
            nameDiv.style.opacity = '0.8';
            messageDiv.appendChild(nameDiv);
        }
        
        const fileIcon = this.getFileIcon(mimeType);
        const fileSizeText = this.formatFileSize(fileSize);
        
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        fileInfo.innerHTML = `
            <span class="file-icon">${fileIcon}</span>
            <div>
                <div class="file-name">${fileName}</div>
                <div class="file-size">${fileSizeText}</div>
            </div>
        `;
        
        const downloadBtn = document.createElement('a');
        downloadBtn.href = fileData;
        downloadBtn.download = fileName;
        downloadBtn.className = 'download-btn';
        downloadBtn.textContent = '다운로드';
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = timestamp;
        
        messageDiv.appendChild(fileInfo);
        messageDiv.appendChild(downloadBtn);
        messageDiv.appendChild(messageTime);
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Sync to popup if open
        this.syncMessagesToPopup();

        // Save to chat history
        this.chatHistory.push({
            type: type,
            message: `[파일] ${fileName} (${fileSizeText})`,
            timestamp: timestamp,
            fullTimestamp: new Date().toISOString()
        });
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎧';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word')) return '📃';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
        if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗃️';
        return '📎';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }



    endCall() {
        // 채팅 저장 확인 모달 표시
        if (this.endCallModal) {
            this.endCallModal.style.display = 'flex';
        }
    }
    
    saveChatAndEnd() {
        // 채팅 저장하고 종료
        this.downloadChatHistory();
        setTimeout(() => {
            this.cleanup();
            location.reload();
        }, 500);
    }
    
    endWithoutSave() {
        // 저장하지 않고 종료
        this.cleanup();
        location.reload();
    }
    
    cancelEnd() {
        // 종료 취소
        if (this.endCallModal) {
            this.endCallModal.style.display = 'none';
        }
    }

    handleCallEnd() {
        alert('상대방이 통화를 종료했습니다.');
        
        // 교사일 경우 Step 2로 돌아가서 다음 학생 대기
        if (this.isHost) {
            // 통화만 정리하고 Peer는 유지
            this.cleanupCall();
            this.showStep(2);
            this.connectionStatus.textContent = '학생의 접속을 기다리는 중...';
            this.connectionStatus.parentElement.style.background = '#fff3cd';
            this.connectionStatus.parentElement.style.borderColor = '#ffc107';
            this.connectionStatus.style.color = '#856404';
        } else {
            // 학생일 경우 페이지 새로고침
            this.cleanup();
            location.reload();
        }
    }

    cleanup() {
        if (this.isScreenSharing) {
            this.stopScreenShare();
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
        }

        if (this.call) {
            this.call.close();
        }

        if (this.connection) {
            this.connection.close();
        }

        if (this.peer) {
            this.peer.destroy();
        }
    }

    // 통화만 정리 (교사가 다음 학생을 기다릴 때)
    cleanupCall() {
        if (this.isScreenSharing) {
            this.stopScreenShare();
        }

        if (this.isWhiteboardActive) {
            this.closeWhiteboard();
        }

        // 비디오 중지 (카메라는 계속 사용)
        if (this.remoteVideo) {
            this.remoteVideo.srcObject = null;
        }

        // 통화와 연결만 닫기 (Peer는 유지)
        if (this.call) {
            this.call.close();
            this.call = null;
        }

        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }

        // 채팅 기록 초기화
        this.chatHistory = [];
        if (this.chatMessages) {
            this.chatMessages.innerHTML = '';
        }

        // 상대방 이름 초기화
        this.remoteName = '';
    }

    // 판서 도구 관련 함수들
    showDrawingTools() {
        if (this.drawingTools) {
            this.drawingTools.style.display = 'block';
        }
    }

    hideDrawingTools() {
        if (this.drawingTools) {
            this.drawingTools.style.display = 'none';
        }
    }

    closeDrawingTools() {
        this.hideDrawingTools();
    }

    createDrawingCanvas() {
        // 로컬 비디오 wrapper에 캔버스 추가
        if (!this.localVideoWrapper) return;

        const canvas = document.createElement('canvas');
        canvas.className = 'drawing-canvas';
        canvas.id = 'drawingCanvas';
        
        // 비디오 크기에 맞춤
        const video = this.localVideo;
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        
        this.localVideoWrapper.style.position = 'relative';
        this.localVideoWrapper.appendChild(canvas);
        
        this.drawingCanvas = canvas;
        this.drawingContext = canvas.getContext('2d');
        
        // 그리기 이벤트 리스너
        canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // 터치 이벤트
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });
    }

    removeDrawingCanvas() {
        if (this.drawingCanvas && this.drawingCanvas.parentNode) {
            this.drawingCanvas.parentNode.removeChild(this.drawingCanvas);
            this.drawingCanvas = null;
            this.drawingContext = null;
        }
        
        // 포인터도 제거
        if (this.pointerElement) {
            this.pointerElement.remove();
            this.pointerElement = null;
        }
    }

    startDrawing(e) {
        // 포인터 모드일 때는 그리기 안 함
        if (this.isPointer) {
            const rect = this.drawingCanvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (this.pointerElement) {
                this.pointerElement.style.display = 'block';
                this.pointerElement.style.left = (rect.left + x) + 'px';
                this.pointerElement.style.top = (rect.top + y) + 'px';
            }
            return;
        }
        
        this.isDrawing = true;
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(x, y);
    }

    draw(e) {
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 포인터 모드일 때는 포인터만 이동
        if (this.isPointer) {
            if (this.pointerElement) {
                this.pointerElement.style.display = 'block';
                this.pointerElement.style.left = (rect.left + x) + 'px';
                this.pointerElement.style.top = (rect.top + y) + 'px';
            }
            return;
        }
        
        if (!this.isDrawing) return;
        
        this.drawingContext.lineTo(x, y);
        
        // 지우개: destination-out 모드로 캔버스만 지움 (배경 비디오는 보임)
        if (this.isEraser) {
            this.drawingContext.globalCompositeOperation = 'destination-out';
            this.drawingContext.lineWidth = 30;
        } else {
            this.drawingContext.globalCompositeOperation = 'source-over';
            this.drawingContext.strokeStyle = this.drawColor.value;
            this.drawingContext.lineWidth = this.drawWidth.value;
        }
        
        this.drawingContext.lineCap = 'round';
        this.drawingContext.lineJoin = 'round';
        this.drawingContext.stroke();
    }

    stopDrawing() {
        // 포인터 숨기기
        if (this.isPointer && this.pointerElement) {
            this.pointerElement.style.display = 'none';
        }
        
        this.isDrawing = false;
        this.drawingContext.beginPath();
    }

    activateEraser() {
        this.isEraser = true;
        this.isPointer = false;
        if (this.eraserBtn) this.eraserBtn.classList.add('active');
        if (this.penBtn) this.penBtn.classList.remove('active');
        if (this.pointerBtn) this.pointerBtn.classList.remove('active');
        if (this.drawingCanvas) {
            this.drawingCanvas.style.cursor = 'pointer';
        }
        // 포인터 제거
        if (this.pointerElement) {
            this.pointerElement.remove();
            this.pointerElement = null;
        }
    }

    activatePen() {
        this.isEraser = false;
        this.isPointer = false;
        if (this.eraserBtn) this.eraserBtn.classList.remove('active');
        if (this.penBtn) this.penBtn.classList.add('active');
        if (this.pointerBtn) this.pointerBtn.classList.remove('active');
        if (this.drawingCanvas) {
            this.drawingCanvas.style.cursor = 'crosshair';
        }
        // 포인터 제거
        if (this.pointerElement) {
            this.pointerElement.remove();
            this.pointerElement = null;
        }
    }

    activatePointer() {
        this.isEraser = false;
        this.isPointer = true;
        if (this.eraserBtn) this.eraserBtn.classList.remove('active');
        if (this.penBtn) this.penBtn.classList.remove('active');
        if (this.pointerBtn) this.pointerBtn.classList.add('active');
        if (this.drawingCanvas) {
            this.drawingCanvas.style.cursor = 'none';
        }
        
        // 포인터 생성
        if (!this.pointerElement) {
            this.pointerElement = document.createElement('div');
            this.pointerElement.style.cssText = `
                position: absolute;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: radial-gradient(circle, rgba(255,0,0,0.8) 0%, rgba(255,0,0,0.4) 50%, rgba(255,0,0,0) 100%);
                pointer-events: none;
                z-index: 10000;
                transform: translate(-50%, -50%);
                display: none;
            `;
            this.localVideoWrapper.appendChild(this.pointerElement);
        }
    }

    clearDrawing() {
        // 화면 공유 판서 캔버스 지우기
        if (this.screenShareDrawingCanvas && this.screenShareDrawingContext) {
            this.screenShareDrawingContext.clearRect(0, 0, this.screenShareDrawingCanvas.width, this.screenShareDrawingCanvas.height);
        }
        // 일반 판서 캔버스 지우기 (사용하지 않지만 호환성 유지)
        if (this.drawingCanvas && this.drawingContext) {
            this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        }
    }

    openDrawingWindow() {
        // 이미 열려있으면 포커스
        if (this.drawingWindow && !this.drawingWindow.closed) {
            this.drawingWindow.focus();
            return;
        }

        // 캔버스 생성 (아직 없으면)
        if (!this.drawingCanvas) {
            this.createDrawingCanvas();
        }

        // 판서 도구 새창 열기
        const width = 350;
        const height = 400;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;

        this.drawingWindow = window.open(
            '', 
            'ezlive_drawing', 
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=no`
        );

        this.drawingWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>🖊️ ezlive 판서 도구</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Segoe UI', sans-serif;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 20px;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                    }
                    .header {
                        background: white;
                        border-radius: 10px;
                        padding: 15px;
                        margin-bottom: 20px;
                        text-align: center;
                        font-size: 1.3rem;
                        font-weight: bold;
                        color: #333;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                    }
                    .tools {
                        background: white;
                        border-radius: 10px;
                        padding: 20px;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }
                    .tool-row {
                        display: flex;
                        align-items: center;
                        gap: 10px;
                    }
                    label {
                        font-weight: 600;
                        color: #555;
                        min-width: 60px;
                    }
                    input[type="color"] {
                        width: 60px;
                        height: 40px;
                        border: 2px solid #ddd;
                        border-radius: 5px;
                        cursor: pointer;
                    }
                    input[type="range"] {
                        flex: 1;
                    }
                    .btn-group {
                        display: flex;
                        gap: 8px;
                        flex-wrap: wrap;
                    }
                    .btn-tool {
                        flex: 1;
                        padding: 12px;
                        border: 2px solid #ddd;
                        background: white;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s;
                        font-size: 0.9rem;
                        font-weight: 600;
                    }
                    .btn-tool:hover {
                        background: #f5f5f5;
                        transform: translateY(-2px);
                    }
                    .btn-tool.active {
                        background: #667eea;
                        color: white;
                        border-color: #667eea;
                    }
                    .width-value {
                        font-weight: bold;
                        color: #667eea;
                        min-width: 30px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="header">🖊️ 판서 도구</div>
                <div class="tools">
                    <div class="tool-row">
                        <label>색상:</label>
                        <input type="color" id="drawColor" value="#ff0000">
                    </div>
                    
                    <div class="tool-row">
                        <label>굵기:</label>
                        <input type="range" id="drawWidth" min="1" max="20" value="3">
                        <span class="width-value" id="widthValue">3</span>
                    </div>
                    
                    <div class="btn-group">
                        <button id="penBtn" class="btn-tool active">🖊️ 펜</button>
                        <button id="eraserBtn" class="btn-tool">🧹 지우개</button>
                    </div>
                    
                    <div class="btn-group">
                        <button id="pointerBtn" class="btn-tool">🔴 포인터</button>
                        <button id="clearDrawingBtn" class="btn-tool">🗑️ 전체삭제</button>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        this.drawingWindow.document.close();

        // 새창의 컨트롤을 부모 창과 연결
        setTimeout(() => {
            const win = this.drawingWindow;
            const mainWindow = window;
            
            // 색상 변경
            win.document.getElementById('drawColor').addEventListener('input', (e) => {
                mainWindow.app.drawColor.value = e.target.value;
                console.log('Color changed to:', e.target.value);
            });
            
            // 굵기 변경
            win.document.getElementById('drawWidth').addEventListener('input', (e) => {
                mainWindow.app.drawWidth.value = parseInt(e.target.value);
                win.document.getElementById('widthValue').textContent = e.target.value;
                console.log('Width changed to:', e.target.value);
            });
            
            // 펜 버튼
            win.document.getElementById('penBtn').addEventListener('click', () => {
                mainWindow.app.activatePen();
                win.document.querySelectorAll('.btn-tool').forEach(b => b.classList.remove('active'));
                win.document.getElementById('penBtn').classList.add('active');
            });
            
            // 지우개 버튼
            win.document.getElementById('eraserBtn').addEventListener('click', () => {
                mainWindow.app.activateEraser();
                win.document.querySelectorAll('.btn-tool').forEach(b => b.classList.remove('active'));
                win.document.getElementById('eraserBtn').classList.add('active');
            });
            
            // 포인터 버튼
            win.document.getElementById('pointerBtn').addEventListener('click', () => {
                mainWindow.app.activatePointer();
                win.document.querySelectorAll('.btn-tool').forEach(b => b.classList.remove('active'));
                win.document.getElementById('pointerBtn').classList.add('active');
            });
            
            // 전체 삭제 버튼
            win.document.getElementById('clearDrawingBtn').addEventListener('click', () => {
                mainWindow.app.clearDrawing();
            });
        }, 100);
    }

    // 화이트보드 토글
    async toggleWhiteboard() {
        if (this.isWhiteboardActive) {
            await this.closeWhiteboard();
        } else {
            await this.openWhiteboard();
        }
    }

    // 화이트보드 열기
    async openWhiteboard() {
        try {
            // 화면 공유 중이면 화면 공유 판서 도구 사용 안내
            if (this.isScreenSharing) {
                alert('화면 공유 중에는 화면공유 판서 도구를 사용하세요.\n채팅 헤더의 ✏️ 버튼을 클릭하세요.');
                return;
            }
            
            // 화이트보드 새창 열기
            const width = 1200;
            const height = 800;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;

            this.whiteboardWindow = window.open(
                '', 
                'ezlive_whiteboard', 
                `width=${width},height=${height},left=${left},top=${top},resizable=yes`
            );

            this.whiteboardWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>✏️ ezlive 화이트보드</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            font-family: 'Segoe UI', sans-serif;
                            background: #f0f0f0;
                            overflow: hidden;
                        }
                        .toolbar {
                            position: fixed;
                            top: 0;
                            left: 0;
                            right: 0;
                            background: white;
                            padding: 15px;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                            display: flex;
                            align-items: center;
                            gap: 15px;
                            z-index: 1000;
                        }
                        .tool-group {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                        }
                        label {
                            font-weight: 600;
                            color: #555;
                        }
                        input[type="color"] {
                            width: 50px;
                            height: 40px;
                            border: 2px solid #ddd;
                            border-radius: 5px;
                            cursor: pointer;
                        }
                        input[type="range"] {
                            width: 120px;
                        }
                        .btn-tool {
                            padding: 10px 20px;
                            border: 2px solid #ddd;
                            background: white;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.3s;
                            font-size: 0.9rem;
                            font-weight: 600;
                        }
                        .btn-tool:hover {
                            background: #f5f5f5;
                            transform: translateY(-2px);
                        }
                        .btn-tool.active {
                            background: #667eea;
                            color: white;
                            border-color: #667eea;
                        }
                        .width-value {
                            font-weight: bold;
                            color: #667eea;
                            min-width: 30px;
                        }
                        #canvas {
                            display: block;
                            cursor: crosshair;
                            margin-top: 70px;
                            background: white;
                            box-shadow: 0 0 20px rgba(0,0,0,0.1);
                        }
                    </style>
                </head>
                <body>
                    <div class="toolbar">
                        <div class="tool-group">
                            <button id="penBtn" class="btn-tool active">🖊️ 펜</button>
                            <button id="eraserBtn" class="btn-tool">🧹 지우개</button>
                            <button id="pointerBtn" class="btn-tool">🔴 포인터</button>
                        </div>
                        <div class="tool-group">
                            <label>색상:</label>
                            <input type="color" id="drawColor" value="#000000">
                        </div>
                        <div class="tool-group">
                            <label>굵기:</label>
                            <input type="range" id="drawWidth" min="1" max="20" value="3">
                            <span class="width-value" id="widthValue">3</span>
                        </div>
                        <div class="tool-group">
                            <button id="clearBtn" class="btn-tool">🗑️ 전체삭제</button>
                        </div>
                        <div class="tool-group" style="border-left: 2px solid #ddd; padding-left: 15px;">
                            <button id="prevPageBtn" class="btn-tool" title="이전 페이지">◀️</button>
                            <span class="width-value" id="pageInfo" style="min-width: 80px; text-align: center;">1 / 1</span>
                            <button id="nextPageBtn" class="btn-tool" title="다음 페이지">▶️</button>
                            <button id="addPageBtn" class="btn-tool" style="background: #2196F3; color: white;">➕ 페이지 추가</button>
                        </div>
                        <div class="tool-group">
                            <button id="savePngBtn" class="btn-tool" style="background: #4CAF50; color: white;">💾 현재페이지 PNG</button>
                            <button id="savePdfBtn" class="btn-tool" style="background: #FF5722; color: white;">📄 모두 저장 (PDF)</button>
                        </div>
                    </div>
                    <canvas id="canvas"></canvas>
                    <script>
                        const canvas = document.getElementById('canvas');
                        const ctx = canvas.getContext('2d');
                        
                        // 캔버스 크기 설정
                        canvas.width = window.innerWidth;
                        canvas.height = window.innerHeight - 70;
                        
                        let isDrawing = false;
                        let currentTool = 'pen';
                        let currentColor = '#000000';
                        let currentWidth = 3;
                        
                        // 멀티 페이지 지원
                        let pages = [canvas.toDataURL()]; // 첫 페이지는 빈 캔버스
                        let currentPage = 0;
                        
                        // 도구 버튼
                        const penBtn = document.getElementById('penBtn');
                        const eraserBtn = document.getElementById('eraserBtn');
                        const pointerBtn = document.getElementById('pointerBtn');
                        const clearBtn = document.getElementById('clearBtn');
                        const drawColor = document.getElementById('drawColor');
                        const drawWidth = document.getElementById('drawWidth');
                        const widthValue = document.getElementById('widthValue');
                        
                        // 페이지 관련 버튼
                        const prevPageBtn = document.getElementById('prevPageBtn');
                        const nextPageBtn = document.getElementById('nextPageBtn');
                        const addPageBtn = document.getElementById('addPageBtn');
                        const pageInfo = document.getElementById('pageInfo');
                        
                        // 페이지 정보 업데이트
                        function updatePageInfo() {
                            pageInfo.textContent = \`\${currentPage + 1} / \${pages.length}\`;
                            prevPageBtn.disabled = currentPage === 0;
                            nextPageBtn.disabled = currentPage === pages.length - 1;
                            
                            prevPageBtn.style.opacity = currentPage === 0 ? '0.5' : '1';
                            nextPageBtn.style.opacity = currentPage === pages.length - 1 ? '0.5' : '1';
                        }
                        
                        // 현재 페이지 저장
                        function saveCurrentPage() {
                            pages[currentPage] = canvas.toDataURL();
                        }
                        
                        // 페이지 로드
                        function loadPage(pageIndex) {
                            const img = new Image();
                            img.onload = () => {
                                ctx.clearRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0);
                            };
                            img.src = pages[pageIndex];
                        }
                        
                        // 펜 모드
                        penBtn.addEventListener('click', () => {
                            currentTool = 'pen';
                            penBtn.classList.add('active');
                            eraserBtn.classList.remove('active');
                            pointerBtn.classList.remove('active');
                            canvas.style.cursor = 'crosshair';
                        });
                        
                        // 지우개 모드
                        eraserBtn.addEventListener('click', () => {
                            currentTool = 'eraser';
                            penBtn.classList.remove('active');
                            eraserBtn.classList.add('active');
                            pointerBtn.classList.remove('active');
                            canvas.style.cursor = 'pointer';
                        });
                        
                        // 포인터 모드
                        pointerBtn.addEventListener('click', () => {
                            currentTool = 'pointer';
                            penBtn.classList.remove('active');
                            eraserBtn.classList.remove('active');
                            pointerBtn.classList.add('active');
                            canvas.style.cursor = 'none';
                        });
                        
                        // 전체 삭제
                        clearBtn.addEventListener('click', () => {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            saveCurrentPage();
                        });
                        
                        // 이전 페이지
                        prevPageBtn.addEventListener('click', () => {
                            if (currentPage > 0) {
                                saveCurrentPage();
                                currentPage--;
                                loadPage(currentPage);
                                updatePageInfo();
                            }
                        });
                        
                        // 다음 페이지
                        nextPageBtn.addEventListener('click', () => {
                            if (currentPage < pages.length - 1) {
                                saveCurrentPage();
                                currentPage++;
                                loadPage(currentPage);
                                updatePageInfo();
                            }
                        });
                        
                        // 페이지 추가
                        addPageBtn.addEventListener('click', () => {
                            saveCurrentPage();
                            pages.push(canvas.toDataURL()); // 빈 페이지 추가
                            currentPage = pages.length - 1;
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            updatePageInfo();
                            alert(\`새 페이지가 추가되었습니다! (페이지 \${currentPage + 1})\`);
                        });
                        
                        // 초기 페이지 정보 표시
                        updatePageInfo();
                        
                        // PNG 저장 (현재 페이지만)
                        const savePngBtn = document.getElementById('savePngBtn');
                        savePngBtn.addEventListener('click', () => {
                            saveCurrentPage();
                            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                            const filename = \`ezlive_whiteboard_page\${currentPage + 1}_\${timestamp}.png\`;
                            
                            canvas.toBlob((blob) => {
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = filename;
                                a.click();
                                URL.revokeObjectURL(url);
                                alert(\`현재 페이지(\${currentPage + 1})가 PNG로 저장되었습니다!\\n파일명: \${filename}\`);
                            }, 'image/png');
                        });
                        
                        // PDF 저장 (모든 페이지)
                        const savePdfBtn = document.getElementById('savePdfBtn');
                        savePdfBtn.addEventListener('click', async () => {
                            try {
                                // 현재 페이지 저장
                                saveCurrentPage();
                                
                                // jsPDF 라이브러리 동적 로드
                                if (typeof window.jspdf === 'undefined') {
                                    const script = document.createElement('script');
                                    script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
                                    document.head.appendChild(script);
                                    
                                    await new Promise((resolve, reject) => {
                                        script.onload = resolve;
                                        script.onerror = reject;
                                    });
                                }
                                
                                const { jsPDF } = window.jspdf;
                                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                                const filename = \`ezlive_whiteboard_\${pages.length}pages_\${timestamp}.pdf\`;
                                
                                // PDF 생성 (캔버스 크기에 맞춤)
                                const pdf = new jsPDF({
                                    orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
                                    unit: 'px',
                                    format: [canvas.width, canvas.height]
                                });
                                
                                // 모든 페이지를 PDF에 추가
                                for (let i = 0; i < pages.length; i++) {
                                    if (i > 0) {
                                        pdf.addPage();
                                    }
                                    pdf.addImage(pages[i], 'PNG', 0, 0, canvas.width, canvas.height);
                                }
                                
                                pdf.save(filename);
                                alert(\`모든 페이지(\${pages.length}페이지)가 PDF로 저장되었습니다!\\n파일명: \${filename}\`);
                            } catch (error) {
                                console.error('PDF 저장 오류:', error);
                                alert('PDF 저장에 실패했습니다. 각 페이지를 PNG로 저장해주세요.');
                            }
                        });
                        
                        // 색상 변경
                        drawColor.addEventListener('input', (e) => {
                            currentColor = e.target.value;
                        });
                        
                        // 굵기 변경
                        drawWidth.addEventListener('input', (e) => {
                            currentWidth = e.target.value;
                            widthValue.textContent = e.target.value;
                        });
                        
                        // 그리기 이벤트
                        canvas.addEventListener('mousedown', startDrawing);
                        canvas.addEventListener('mousemove', draw);
                        canvas.addEventListener('mouseup', stopDrawing);
                        canvas.addEventListener('mouseout', stopDrawing);
                        
                        // 터치 이벤트
                        canvas.addEventListener('touchstart', (e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const mouseEvent = new MouseEvent('mousedown', {
                                clientX: touch.clientX,
                                clientY: touch.clientY
                            });
                            canvas.dispatchEvent(mouseEvent);
                        });
                        
                        canvas.addEventListener('touchmove', (e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const mouseEvent = new MouseEvent('mousemove', {
                                clientX: touch.clientX,
                                clientY: touch.clientY
                            });
                            canvas.dispatchEvent(mouseEvent);
                        });
                        
                        canvas.addEventListener('touchend', (e) => {
                            e.preventDefault();
                            const mouseEvent = new MouseEvent('mouseup', {});
                            canvas.dispatchEvent(mouseEvent);
                        });
                        
                        function startDrawing(e) {
                            if (currentTool === 'pointer') return;
                            isDrawing = true;
                            const rect = canvas.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            ctx.beginPath();
                            ctx.moveTo(x, y);
                        }
                        
                        function draw(e) {
                            if (currentTool === 'pointer') return;
                            if (!isDrawing) return;
                            
                            const rect = canvas.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const y = e.clientY - rect.top;
                            
                            ctx.lineTo(x, y);
                            ctx.strokeStyle = currentTool === 'eraser' ? '#FFFFFF' : currentColor;
                            ctx.lineWidth = currentTool === 'eraser' ? 30 : currentWidth;
                            ctx.lineCap = 'round';
                            ctx.lineJoin = 'round';
                            ctx.stroke();
                        }
                        
                        function stopDrawing() {
                            if (isDrawing) {
                                isDrawing = false;
                                ctx.beginPath();
                                // 그리기가 끝나면 현재 페이지 저장
                                saveCurrentPage();
                            }
                        }
                        
                        // 창 크기 조절
                        window.addEventListener('resize', () => {
                            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                            canvas.width = window.innerWidth;
                            canvas.height = window.innerHeight - 70;
                            ctx.putImageData(imageData, 0, 0);
                        });
                    </script>
                </body>
                </html>
            `);
            
            this.whiteboardWindow.document.close();
            
            // 화이트보드 스트림 캡처 (약간의 지연 후)
            setTimeout(async () => {
                try {
                    // 화이트보드 창을 화면 공유로 캡처
                    const canvas = this.whiteboardWindow.document.getElementById('canvas');
                    if (canvas) {
                        this.whiteboardStream = canvas.captureStream(30); // 30 FPS
                        
                        // 원본 카메라 스트림 저장 (처음 열 때만)
                        if (!this.originalStream) {
                            this.originalStream = this.localStream;
                        }
                        
                        // 화이트보드 스트림으로 전환
                        const audioTrack = this.originalStream.getAudioTracks()[0];
                        const videoTrack = this.whiteboardStream.getVideoTracks()[0];
                        this.localStream = new MediaStream([videoTrack, audioTrack]);
                        
                        this.localVideo.srcObject = this.localStream;
                        
                        // 상대방에게 스트림 전송
                        if (this.call && this.call.peerConnection) {
                            const sender = this.call.peerConnection.getSenders().find(s => 
                                s.track && s.track.kind === 'video'
                            );
                            if (sender) {
                                sender.replaceTrack(videoTrack);
                            }
                        }
                        
                        this.isWhiteboardActive = true;
                        if (this.whiteboardBtn) {
                            this.whiteboardBtn.classList.add('active');
                        }
                        
                        // 채팅 알림
                        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                        });
                        this.displayMessage(`화이트보드를 시작했습니다.`, 'system', timestamp);
                    }
                } catch (error) {
                    console.error('화이트보드 스트림 캡처 오류:', error);
                    alert('화이트보드 스트림 캡처에 실패했습니다.');
                }
            }, 1000);
            
            // 화이트보드 창이 닫히면
            const checkClosed = setInterval(() => {
                if (this.whiteboardWindow && this.whiteboardWindow.closed) {
                    clearInterval(checkClosed);
                    this.closeWhiteboard();
                }
            }, 500);
            
        } catch (error) {
            console.error('화이트보드 열기 오류:', error);
            alert('화이트보드를 열 수 없습니다.');
        }
    }

    // 화이트보드 닫기
    async closeWhiteboard() {
        try {
            // 화이트보드 창 닫기
            if (this.whiteboardWindow && !this.whiteboardWindow.closed) {
                this.whiteboardWindow.close();
            }
            
            // 스트림 복원
            if (this.whiteboardStream) {
                this.whiteboardStream.getTracks().forEach(track => track.stop());
            }
            
            if (this.originalStream) {
                // 원본 카메라 스트림으로 복원
                this.localStream = this.originalStream;
                this.localVideo.srcObject = this.localStream;
                
                // 상대방에게 원본 스트림 전송
                if (this.call && this.call.peerConnection) {
                    const videoTrack = this.originalStream.getVideoTracks()[0];
                    const sender = this.call.peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (sender && videoTrack) {
                        await sender.replaceTrack(videoTrack);
                    }
                }
                
                // originalStream은 유지 (다음에 다시 사용)
                // this.originalStream = null; ← 이 줄을 제거하여 카메라 스트림 유지
            }
            
            this.whiteboardWindow = null;
            this.whiteboardStream = null;
            this.isWhiteboardActive = false;
            
            if (this.whiteboardBtn) {
                this.whiteboardBtn.classList.remove('active');
            }
            
            // 채팅 알림
            const timestamp = new Date().toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            this.displayMessage(`화이트보드를 종료했습니다.`, 'system', timestamp);
            
        } catch (error) {
            console.error('화이트보드 닫기 오류:', error);
        }
    }

    // 화면공유용 판서 도구 (별도)
    toggleScreenShareDrawing() {
        if (this.isScreenShareDrawing) {
            this.closeScreenShareDrawing();
        } else {
            this.openScreenShareDrawing();
        }
    }

    openScreenShareDrawing() {
        if (!this.isScreenSharing) {
            alert('화면 공유 중에만 사용할 수 있습니다.');
            return;
        }
        
        // 주의: 화면공유 판서는 본인 화면에만 표시되며 상대방에게는 전송되지 않습니다
        console.warn('⚠️ 화면공유 판서 도구는 로컬에서만 작동합니다. 상대방에게는 보이지 않습니다.');
        
        // 캔버스가 없으면 생성
        if (!this.screenShareDrawingCanvas) {
            this.createScreenShareDrawingCanvas();
        }
        
        // 판서 도구 창 열기
        this.openDrawingWindow();
        this.isScreenShareDrawing = true;
        
        // 버튼 active 상태 추가
        if (this.drawingBtn) {
            this.drawingBtn.classList.add('active');
        }
        if (this.screenShareDrawingBtn) {
            this.screenShareDrawingBtn.classList.add('active');
        }
        
        // 종료 버튼 표시
        if (this.closeDrawingBtn) {
            this.closeDrawingBtn.style.display = 'inline-block';
        }
    }

    closeScreenShareDrawing() {
        if (this.screenShareDrawingCanvas) {
            this.removeScreenShareDrawingCanvas();
        }
        
        if (this.drawingWindow && !this.drawingWindow.closed) {
            this.drawingWindow.close();
            this.drawingWindow = null;
        }
        
        this.isScreenShareDrawing = false;
        
        // 버튼 active 상태 제거
        if (this.drawingBtn) {
            this.drawingBtn.classList.remove('active');
        }
        if (this.screenShareDrawingBtn) {
            this.screenShareDrawingBtn.classList.remove('active');
        }
        
        // 종료 버튼 숨기기
        if (this.closeDrawingBtn) {
            this.closeDrawingBtn.style.display = 'none';
        }
    }
    
    forceCloseDrawing() {
        // 판서도구 완전히 종료
        this.closeScreenShareDrawing();
        
        // 포인터 제거
        if (this.pointerElement) {
            this.pointerElement.remove();
            this.pointerElement = null;
        }
        
        // 상태 초기화
        this.isDrawing = false;
        this.isEraser = false;
        this.isPointer = false;
        
        // 버튼 상태 초기화
        if (this.drawingBtn) {
            this.drawingBtn.classList.remove('active');
        }
        if (this.screenShareDrawingBtn) {
            this.screenShareDrawingBtn.classList.remove('active');
        }
        if (this.penBtn) {
            this.penBtn.classList.remove('active');
        }
        if (this.eraserBtn) {
            this.eraserBtn.classList.remove('active');
        }
        if (this.pointerBtn) {
            this.pointerBtn.classList.remove('active');
        }
        
        // 모든 이벤트 리스너 제거를 위해 캔버스를 완전히 재생성
        const oldCanvas = document.getElementById('screenShareDrawingCanvas');
        if (oldCanvas && oldCanvas.parentNode) {
            oldCanvas.parentNode.removeChild(oldCanvas);
        }
        
        alert('판서도구가 종료되었습니다.');
    }

    createScreenShareDrawingCanvas() {
        if (!this.localVideoWrapper) return;
        
        const canvas = document.createElement('canvas');
        canvas.className = 'screen-share-drawing-canvas';
        canvas.id = 'screenShareDrawingCanvas';
        
        const video = this.localVideo;
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.zIndex = '100';
        canvas.style.pointerEvents = 'auto';
        canvas.style.cursor = 'crosshair';
        
        this.localVideoWrapper.style.position = 'relative';
        this.localVideoWrapper.appendChild(canvas);
        
        this.screenShareDrawingCanvas = canvas;
        this.screenShareDrawingContext = canvas.getContext('2d');
        
        // 그리기 이벤트
        canvas.addEventListener('mousedown', (e) => this.startScreenShareDrawing(e));
        canvas.addEventListener('mousemove', (e) => this.drawScreenShare(e));
        canvas.addEventListener('mouseup', () => this.stopScreenShareDrawing());
        canvas.addEventListener('mouseout', () => this.stopScreenShareDrawing());
        
        // 터치 이벤트
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });
        
        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });
    }

    removeScreenShareDrawingCanvas() {
        if (this.screenShareDrawingCanvas && this.screenShareDrawingCanvas.parentNode) {
            this.screenShareDrawingCanvas.parentNode.removeChild(this.screenShareDrawingCanvas);
            this.screenShareDrawingCanvas = null;
            this.screenShareDrawingContext = null;
        }
    }

    startScreenShareDrawing(e) {
        if (this.isPointer) return;
        this.isDrawing = true;
        const rect = this.screenShareDrawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.screenShareDrawingContext.beginPath();
        this.screenShareDrawingContext.moveTo(x, y);
    }

    drawScreenShare(e) {
        const rect = this.screenShareDrawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 포인터 모드일 때는 붉은 점만 표시
        if (this.isPointer) {
            if (this.pointerElement) {
                this.pointerElement.style.left = e.clientX + 'px';
                this.pointerElement.style.top = e.clientY + 'px';
                this.pointerElement.style.display = 'block';
            }
            return;
        }
        
        if (!this.isDrawing) return;
        
        this.screenShareDrawingContext.lineTo(x, y);
        // 지우개는 투명색으로 (캔버스만 지움, 배경 비디오는 보임)
        if (this.isEraser) {
            this.screenShareDrawingContext.globalCompositeOperation = 'destination-out';
            this.screenShareDrawingContext.lineWidth = 30;
        } else {
            this.screenShareDrawingContext.globalCompositeOperation = 'source-over';
            this.screenShareDrawingContext.strokeStyle = this.drawColor ? this.drawColor.value : '#ff0000';
            this.screenShareDrawingContext.lineWidth = this.drawWidth ? this.drawWidth.value : 3;
        }
        this.screenShareDrawingContext.lineCap = 'round';
        this.screenShareDrawingContext.lineJoin = 'round';
        this.screenShareDrawingContext.stroke();
    }

    stopScreenShareDrawing() {
        this.isDrawing = false;
        if (this.screenShareDrawingContext) {
            this.screenShareDrawingContext.beginPath();
        }
    }
}

// Initialize the application
const app = new EzLive();
