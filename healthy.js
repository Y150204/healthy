// health-assistant.js - 健康慧诊助手前端逻辑

class HealthAssistant {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.apiUrl = options.apiUrl || 'https://api.example.com/health-assistant';
        this.isLoading = false;
        this.messages = [];
        
        this.init();
    }
    
    init() {
        this.renderUI();
        this.bindEvents();
        this.loadInitialMessage();
    }
    
    renderUI() {
        // 创建主容器
        this.container.innerHTML = '';
        
        const mainDiv = document.createElement('div');
        mainDiv.className = 'health-assistant-container';
        mainDiv.style.cssText = `
            font-family: 'PingFang SC', 'Noto Sans SC', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
            min-height: 600px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        `;
        
        // 标题区域
        const header = document.createElement('div');
        header.style.cssText = `
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #4d53e8;
        `;
        
        const title = document.createElement('h1');
        title.textContent = '健康慧诊助手';
        title.style.cssText = `
            color: #333;
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        `;
        
        const subtitle = document.createElement('p');
        subtitle.textContent = '专业健康咨询与建议';
        subtitle.style.cssText = `
            color: #666;
            margin: 10px 0 0 0;
            font-size: 16px;
        `;
        
        header.appendChild(title);
        header.appendChild(subtitle);
        
        // 聊天区域
        const chatArea = document.createElement('div');
        chatArea.className = 'chat-area';
        chatArea.style.cssText = `
            height: 400px;
            overflow-y: auto;
            margin-bottom: 20px;
            padding: 20px;
            background: white;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        `;
        this.chatArea = chatArea;
        
        // 输入区域
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex;
            gap: 10px;
        `;
        
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = '请输入您的健康问题...';
        inputField.style.cssText = `
            flex: 1;
            padding: 12px 15px;
            border: 2px solid #4d53e8;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            transition: border-color 0.3s;
        `;
        inputField.addEventListener('focus', () => {
            inputField.style.borderColor = '#6675D9';
        });
        inputField.addEventListener('blur', () => {
            inputField.style.borderColor = '#4d53e8';
        });
        this.inputField = inputField;
        
        const sendButton = document.createElement('button');
        sendButton.textContent = '发送';
        sendButton.style.cssText = `
            padding: 12px 24px;
            background: #4d53e8;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s;
        `;
        sendButton.addEventListener('mouseover', () => {
            sendButton.style.background = '#6675D9';
        });
        sendButton.addEventListener('mouseout', () => {
            sendButton.style.background = '#4d53e8';
        });
        
        inputContainer.appendChild(inputField);
        inputContainer.appendChild(sendButton);
        
        // 加载指示器
        const loader = document.createElement('div');
        loader.className = 'loader';
        loader.style.cssText = `
            display: none;
            text-align: center;
            padding: 10px;
            color: #4d53e8;
        `;
        loader.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <style>
                    @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                    svg {
                        animation: rotate 1s linear infinite;
                    }
                </style>
                <circle cx="12" cy="12" r="10" stroke-width="4" stroke-dasharray="30" stroke-linecap="round"/>
            </svg>
            正在分析您的健康问题...
        `;
        this.loader = loader;
        
        // 免责声明
        const disclaimer = document.createElement('div');
        disclaimer.style.cssText = `
            margin-top: 20px;
            padding: 15px;
            background: #fff8e1;
            border-left: 4px solid #ffc107;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
        `;
        disclaimer.innerHTML = `
            <strong>免责声明：</strong>本助手提供的健康建议仅供参考，不能替代专业医疗意见。如有严重症状，请立即就医。
        `;
        
        // 组装所有元素
        mainDiv.appendChild(header);
        mainDiv.appendChild(chatArea);
        mainDiv.appendChild(loader);
        mainDiv.appendChild(inputContainer);
        mainDiv.appendChild(disclaimer);
        
        this.container.appendChild(mainDiv);
    }
    
    bindEvents() {
        const sendButton = this.container.querySelector('button');
        const inputField = this.inputField;
        
        // 发送按钮点击事件
        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // 输入框回车事件
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }
    
    loadInitialMessage() {
        const welcomeMessage = {
            type: 'assistant',
            content: '您好！我是健康慧诊助手。我可以为您提供健康咨询、症状分析、饮食建议等服务。请告诉我您的健康问题。',
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.addMessage(welcomeMessage);
    }
    
    addMessage(message) {
        this.messages.push(message);
        this.renderMessage(message);
    }
    
    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            margin-bottom: 15px;
            padding: 12px 16px;
            border-radius: 12px;
            max-width: 80%;
            word-wrap: break-word;
            line-height: 1.5;
        `;
        
        if (message.type === 'user') {
            messageDiv.style.cssText += `
                background: #4d53e8;
                color: white;
                margin-left: auto;
                border-bottom-right-radius: 4px;
            `;
        } else {
            messageDiv.style.cssText += `
                background: #f0f2ff;
                color: #333;
                border-bottom-left-radius: 4px;
            `;
            
            // 添加时间戳
            const timeSpan = document.createElement('div');
            timeSpan.textContent = message.timestamp;
            timeSpan.style.cssText = `
                font-size: 11px;
                color: #999;
                margin-top: 5px;
                text-align: right;
            `;
            messageDiv.appendChild(timeSpan);
        }
        
        messageDiv.textContent = message.content;
        this.chatArea.appendChild(messageDiv);
        this.chatArea.scrollTop = this.chatArea.scrollHeight;
    }
    
    async sendMessage() {
        const inputField = this.inputField;
        const question = inputField.value.trim();
        
        if (!question || this.isLoading) return;
        
        // 添加用户消息
        const userMessage = {
            type: 'user',
            content: question,
            timestamp: new Date().toLocaleTimeString()
        };
        this.addMessage(userMessage);
        
        // 清空输入框
        inputField.value = '';
        
        // 显示加载指示器
        this.isLoading = true;
        this.loader.style.display = 'block';
        
        try {
            // 模拟API调用
            const response = await this.simulateAPIResponse(question);
            
            // 添加助手回复
            const assistantMessage = {
                type: 'assistant',
                content: response,
                timestamp: new Date().toLocaleTimeString()
            };
            this.addMessage(assistantMessage);
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = {
                type: 'assistant',
                content: '抱歉，暂时无法处理您的请求。请稍后再试。',
                timestamp: new Date().toLocaleTimeString()
            };
            this.addMessage(errorMessage);
        } finally {
            // 隐藏加载指示器
            this.isLoading = false;
            this.loader.style.display = 'none';
        }
    }
    
    async simulateAPIResponse(question) {
        // 模拟延迟
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 简单的关键词匹配回复
        const responses = {
            '头痛': '头痛可能是多种原因引起的，如压力、疲劳、感冒或视力问题。建议多休息，保持充足睡眠。如果持续疼痛，请咨询医生。',
            '发烧': '发烧是身体对抗感染的表现。建议多喝水、休息，可使用退烧药。如果体温超过39°C或持续不退，请及时就医。',
            '咳嗽': '咳嗽可能是感冒、过敏或呼吸道感染的症状。多喝温水，避免刺激性食物。如果咳嗽持续一周以上，建议看医生。',
            '胃痛': '胃痛可能与饮食不当、胃炎或消化不良有关。建议吃易消化的食物，避免辛辣油腻。如果疼痛剧烈，请就医检查。',
            '失眠': '失眠可能与压力、作息不规律有关。建议建立规律的作息时间，睡前避免使用电子设备，可以尝试冥想或放松练习。',
            '饮食': '均衡饮食应包括蔬菜、水果、全谷物、蛋白质和健康脂肪。建议每天喝足够的水，限制加工食品和糖分摄入。'
        };
        
        // 查找匹配的关键词
        for (const [keyword, response] of Object.entries(responses)) {
            if (question.includes(keyword)) {
                return response;
            }
        }
        
        // 默认回复
        return `感谢您的咨询："${question}"。这是一个重要的健康问题。建议您：1. 详细记录症状 2. 观察症状变化 3. 如有需要，及时咨询专业医生获取准确诊断。`;
    }
}

// 使用示例
document.addEventListener('DOMContentLoaded', function() {
    // 创建健康助手实例
    const healthAssistant = new HealthAssistant({
        container: document.getElementById('health-assistant-container') || document.body
    });
    
    // 如果需要全局访问
    window.HealthAssistant = HealthAssistant;
    window.healthAssistant = healthAssistant;
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HealthAssistant;
}