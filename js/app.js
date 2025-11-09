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
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.isRecording = false;
        this.invitationCode = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.setupChatSync();
        this.checkInvitationLink();
    }

    initializeElements() {
        // Step elements
        this.step1 = document.getElementById('step1');
        this.step2 = document.getElementById('step2');
        this.step3 = document.getElementById('step3');

        // Buttons
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
        this.teacherName = document.getElementById('teacherName');
        this.studentName = document.getElementById('studentName');
        this.endCallBtn = document.getElementById('endCallBtn');
        this.lmsBtn = document.getElementById('lmsBtn');
        this.replayBtn = document.getElementById('replayBtn');
        this.toggleChatViewBtn = document.getElementById('toggleChatViewBtn');
        this.controlsBar = document.getElementById('controlsBar');

        // Containers
        this.chatContainer = document.getElementById('chatContainer');
        this.remoteVideoWrapper = document.getElementById('remoteVideoWrapper');
        this.localVideoWrapper = document.getElementById('localVideoWrapper');
        this.mainLayout = document.getElementById('mainLayout');

        // Inputs
        this.joinPeerIdInput = document.getElementById('joinPeerId');
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
        this.closeDrawingBtn = document.getElementById('closeDrawingBtn');
    }

    attachEventListeners() {
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
        if (this.replayBtn) this.replayBtn.addEventListener('click', () => window.open('https://jlive.co.kr/', '_blank'));
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
        if (this.clearDrawingBtn) this.clearDrawingBtn.addEventListener('click', () => this.clearDrawing());
        if (this.closeDrawingBtn) this.closeDrawingBtn.addEventListener('click', () => this.closeDrawingTools());
    }

    showStep(stepNumber) {
        [this.step1, this.step2, this.step3].forEach(step => {
            step.classList.remove('active');
        });

        switch(stepNumber) {
            case 1:
                this.step1.classList.add('active');
                this.controlsBar.style.display = 'none';
                break;
            case 2:
                this.step2.classList.add('active');
                this.controlsBar.style.display = 'none';
                break;
            case 3:
                this.step3.classList.add('active');
                this.controlsBar.style.display = 'flex';
                break;
        }
    }

    checkInvitationLink() {
        // URL에서 invitation-code 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const invitationCode = urlParams.get('invitation-code');
        
        if (invitationCode) {
            this.invitationCode = invitationCode;
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
        
        // 교사 비밀번호 확인 (클라이언트 측 검증)
        const password = this.teacherPassword.value.trim();
        if (password !== 'a123456!') {
            alert('교사 비밀번호가 올바르지 않습니다.');
            return;
        }

        try {
            this.isHost = true;
            this.myName = name;
            
            // Create a new Peer with random ID
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
                this.myPeerIdDisplay.textContent = id;
                
                // 초대링크 생성 및 표시
                this.generateInvitationLink(id);
                
                this.showStep(2);
                this.setupPeerListeners();
            });

            this.peer.on('error', (err) => {
                console.error('Peer error:', err);
                alert('연결 오류가 발생했습니다: ' + err.message);
            });

        } catch (error) {
            console.error('Error creating host:', error);
            alert('호스트 생성 중 오류가 발생했습니다.');
        }
    }

    async joinPeer() {
        const name = this.studentName.value.trim();
        const remotePeerId = this.joinPeerIdInput.value.trim();
        
        if (!name) {
            alert('학생 이름을 입력해주세요.');
            return;
        }
        
        if (!remotePeerId) {
            alert('강의 코드를 입력해주세요.');
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
            // 이름 교환
            this.connection.send({
                type: 'name',
                name: this.myName
            });
        });

        this.connection.on('data', (data) => {
            console.log('Received data:', data);
            if (data.type === 'name') {
                // 상대방 이름 저장
                this.remoteName = data.name;
                this.updateVideoLabels();
            } else if (data.type === 'file') {
                this.receiveFile(data);
            } else if (data.type === 'message') {
                this.displayMessage(data.message, 'received', data.timestamp, data.senderName);
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
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            this.localVideo.srcObject = this.localStream;
            console.log('Got local stream');
            
        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('카메라 또는 마이크에 접근할 수 없습니다. 권한을 확인해주세요.');
            throw error;
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
            if (!navigator.mediaDevices.getDisplayMedia) {
                alert('화면 공유는 이 브라우저에서 지원되지 않습니다.');
                return;
            }

            this.screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always'
                },
                audio: false
            });

            this.originalStream = this.localStream;
            const audioTrack = this.originalStream.getAudioTracks()[0];
            const screenVideoTrack = this.screenStream.getVideoTracks()[0];
            this.localStream = new MediaStream([screenVideoTrack, audioTrack]);

            this.localVideo.srcObject = this.localStream;

            if (this.call && this.call.peerConnection) {
                const sender = this.call.peerConnection.getSenders().find(s => 
                    s.track && s.track.kind === 'video'
                );
                if (sender) {
                    sender.replaceTrack(screenVideoTrack);
                }
            }

            this.isScreenSharing = true;
            this.shareScreenBtn.innerHTML = '<span class="icon">🖥️</span>';
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

            // 판서 도구 표시 및 캔버스 생성
            this.showDrawingTools();
            this.createDrawingCanvas();

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
                    const videoTrack = this.originalStream.getVideoTracks()[0];
                    const sender = this.call.peerConnection.getSenders().find(s => 
                        s.track && s.track.kind === 'video'
                    );
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    }
                }
            }

            this.isScreenSharing = false;
            this.shareScreenBtn.innerHTML = '<span class="icon">🖥️</span>';
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
            
            // 판서 도구 숨기기 및 캔버스 제거
            this.hideDrawingTools();
            this.removeDrawingCanvas();

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
            // 화면 + 오디오 캡처
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: {
                    cursor: 'always',
                    displaySurface: 'monitor'
                },
                audio: false
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
        // 브라우저 다운로드 폴더 안내
        const timestamp = new Date().toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        
        let message = '녹화 파일은 브라우저 기본 다운로드 폴더에 저장됩니다.\n\n';
        
        if (isMac) {
            message += '📁 Mac 다운로드 폴더:\n';
            message += '- ~/Downloads/\n';
            message += '- Finder > 다운로드\n\n';
            message += '💡 Tip: Finder에서 Command + Option + L을 누르면 다운로드 폴더가 열립니다.';
        } else {
            message += '📁 Windows 다운로드 폴더:\n';
            message += '- C:\\Users\\사용자명\\Downloads\\\n';
            message += '- 내 PC > 다운로드\n\n';
            message += '💡 Tip: Windows 탐색기 주소창에 다음을 입력하세요:\n';
            message += 'shell:downloads';
        }
        
        alert(message);
        
        // 채팅에도 안내
        this.displayMessage(`녹화 파일은 브라우저 다운로드 폴더에 저장됩니다.`, 'system', timestamp);
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

            // 채팅창을 오른쪽에 고정
            this.chatContainer.classList.add('fullscreen-side');

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
        this.cleanup();
        location.reload();
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
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.drawingContext.beginPath();
        this.drawingContext.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.drawingCanvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.drawingContext.lineTo(x, y);
        this.drawingContext.strokeStyle = this.isEraser ? '#FFFFFF' : this.drawColor.value;
        this.drawingContext.lineWidth = this.isEraser ? 20 : this.drawWidth.value;
        this.drawingContext.lineCap = 'round';
        this.drawingContext.lineJoin = 'round';
        this.drawingContext.stroke();
    }

    stopDrawing() {
        this.isDrawing = false;
        this.drawingContext.beginPath();
    }

    activateEraser() {
        this.isEraser = true;
        if (this.eraserBtn) this.eraserBtn.classList.add('active');
        if (this.penBtn) this.penBtn.classList.remove('active');
        if (this.drawingCanvas) {
            this.drawingCanvas.style.cursor = 'pointer';
        }
    }

    activatePen() {
        this.isEraser = false;
        if (this.eraserBtn) this.eraserBtn.classList.remove('active');
        if (this.penBtn) this.penBtn.classList.add('active');
        if (this.drawingCanvas) {
            this.drawingCanvas.style.cursor = 'crosshair';
        }
    }

    clearDrawing() {
        if (this.drawingCanvas && this.drawingContext) {
            this.drawingContext.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        }
    }
}

// Initialize the application
const app = new EzLive();
