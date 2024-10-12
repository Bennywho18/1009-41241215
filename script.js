let gameStarted = false; // 遊戲狀態標記
let currentTheme = 'history'; // 預設主題
let countdownTimer; // 倒數計時器變量
let countdownInterval; // 計時器更新的interval
let gameStartTime; // 遊戲開始時間
let gameTimerInterval; // 計時器來顯示遊戲經過的時間
let matchedPairs = 0; // 成功配對的卡片對數
let gridSize = 2; // 預設網格大小為 2x2
let lastFlippedCard; // 用於儲存最後一張翻轉的卡片
let flippedCards = []; // 存儲翻轉的卡片

const yesSound = new Audio('music/yes.mp3');  // 請將 'path/to/yes.mp3' 替換為你的音效文件路徑
const noSound = new Audio('music/no.mp3');    // 請將 'path/to/no.mp3' 替換為你的音效文件路徑

// Fisher-Yates 洗牌演算法，用來打亂陣列
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 交換元素
    }
    return array;
}

// 随机选择指定数量的图片
function getRandomImages(images, numPairs) {
    let shuffledImages = images.sort(() => 0.5 - Math.random()); // 随机打乱图片顺序
    return shuffledImages.slice(0, numPairs); // 选取指定数量的图片
}

// 动态生成卡片的函数
function generateCards(theme, gridSize) {
    const cardsWrapper = document.getElementById('cardsWrapper');
    cardsWrapper.innerHTML = ''; // 清空现有卡片
    let frontImageSrc, backImages;

    // 根据当前主题设置正面和背面图片
    if (theme === 'history') {
        frontImageSrc = 'history/history1.png'; // History 主题的正面
        backImages = Array.from({ length: 18 }, (_, i) => `history/history${i + 2}.png`); // History 主题的背面
    } else if (theme === 'one') {
        frontImageSrc = 'one/one1.png'; // One 主题的正面
        backImages = Array.from({ length: 18 }, (_, i) => `one/one${i + 2}.png`); // One 主题的背面
    }

    // 确定需要的图片对数（对于 2x2 网格， numPairs = 2）
    let numPairs = gridSize * gridSize / 2; // 获取网格中所需的图片对数
    let selectedBackImages = getRandomImages(backImages, numPairs); // 随机选择图片
    let allBackImages = shuffle([...selectedBackImages, ...selectedBackImages]); // 复制图片并打乱顺序

    // 设置网格的 CSS 大小
    cardsWrapper.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    cardsWrapper.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    // 生成卡片
    allBackImages.forEach((backImage, index) => {
        // 创建卡片容器
        const cardContainer = document.createElement('div');
        cardContainer.classList.add('card-container');
        cardContainer.id = `card${index + 1}`;

        // 创建卡片结构
        const card = document.createElement('div');
        card.classList.add('card');

        const cardFront = document.createElement('div');
        cardFront.classList.add('card-front');
        const frontImg = document.createElement('img');
        frontImg.src = frontImageSrc; // 使用主题的正面图片
        frontImg.alt = 'Front Image';
        cardFront.appendChild(frontImg);

        const cardBack = document.createElement('div');
        cardBack.classList.add('card-back');
        const backImg = document.createElement('img');
        backImg.src = backImage; // 打乱后的背面图片
        backImg.alt = `Back Image ${index + 1}`;
        cardBack.appendChild(backImg);

        // 将前后面加入卡片中
        card.appendChild(cardFront);
        card.appendChild(cardBack);

        // 将卡片加入卡片容器中
        cardContainer.appendChild(card);

        // 点击翻转效果
        cardContainer.addEventListener('click', handleCardClick);

        // 将卡片容器加入父容器
        cardsWrapper.appendChild(cardContainer);
    });
}

function handleCardClick() {
    if (flippedCards.length < 2 && !this.classList.contains('matched')) {
        this.classList.toggle('flip');
        flippedCards.push(this);

        if (flippedCards.length === 2) {
            checkForMatch();
        }
    }
}

function checkForMatch() {
    const [card1, card2] = flippedCards;
    const card1BackImg = card1.querySelector('.card-back img').src;
    const card2BackImg = card2.querySelector('.card-back img').src;

    if (card1BackImg === card2BackImg) {
        // 成功配對，播放成功音效
        yesSound.play();

        card1.classList.add('matched');
        card2.classList.add('matched');
        matchedPairs++;

        // 检查是否需要隐藏已完成的卡片
        const hideCompleted = document.getElementById('hide-completed').checked;

        // 如果勾选了隐藏已完成的卡片
        if (hideCompleted) {
            // 隐藏已配对成功的卡片
            setTimeout(() => {
                card1.style.visibility = 'hidden';
                card2.style.visibility = 'hidden';

                // 检查是否为最后一对配对成功
                if (matchedPairs === gridSize * gridSize / 2) {
                    setTimeout(() => {
                        endGame(); // 显示完成时间
                    }, 500);
                }
            }, 1000);  // 延迟1秒后隐藏卡片，确保动画可见
        } else {
            // 如果未勾选，则不隐藏，只是保留匹配状态
            if (matchedPairs === gridSize * gridSize / 2) {
                setTimeout(() => {
                    endGame(); // 显示完成时间
                }, 500);
            }
        }
    } else {
        // 未配对成功，播放失败音效
        noSound.play();

        // 未配对成功，將卡片翻回背面
        setTimeout(() => {
            card1.classList.remove('flip');
            card2.classList.remove('flip');
        }, 1000);
    }
    flippedCards = [];
}


// 遊戲結束並顯示花費的時間
function endGame() {
    clearInterval(gameTimerInterval); // 停止遊戲計時
    const endTime = new Date().getTime();
    const timeSpent = Math.floor((endTime - gameStartTime) / 1000); // 計算花費的秒數
    alert(`恭喜！你完成了遊戲，花費了 ${timeSpent} 秒`);
}



// 開始遊戲倒數計時
function startCountdown(selectedTime) {
    const countdownDisplay = document.getElementById('countdown');
    countdownDisplay.style.display = 'block'; // 顯示倒數
    countdownTimer = selectedTime; // 根據選擇的秒數設置倒數
    countdownDisplay.textContent = `倒數：${countdownTimer}秒`;

    // 開始倒數計時
    countdownInterval = setInterval(() => {
        countdownTimer--;
        countdownDisplay.textContent = `倒數：${countdownTimer}秒`;

        if (countdownTimer === 0) {
            clearInterval(countdownInterval); // 停止倒數
            countdownDisplay.style.display = 'none'; // 隱藏倒數
            flipAllCardsToFront(); // 將所有卡片翻回正面
            startGameTimer(); // 開始遊戲計時
        }
    }, 1000); // 每秒更新一次倒數
}

// 將所有卡片翻回正面
function flipAllCardsToFront() {
    const cards = document.querySelectorAll('.card-container');
    cards.forEach(card => {
        card.classList.remove('flip'); // 全部翻回正面
    });
}

// 開始記錄遊戲花費的時間並顯示在頁面上
function startGameTimer() {
    gameStartTime = new Date().getTime();
    const timerDisplay = document.getElementById('timer'); // 顯示遊戲時間的元素
    timerDisplay.style.display = 'block'; // 顯示計時器

    gameTimerInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const timeSpent = Math.floor((currentTime - gameStartTime) / 1000);
        timerDisplay.textContent = `遊戲時間：${timeSpent}秒`;
    }, 1000); // 每秒更新遊戲時間
}

// 提示功能
function showHint() {
    const unmatchedCards = []; // 存储尚未配对的卡片

    // 遍历所有卡片，找出尚未配对的卡片
    document.querySelectorAll('.card-container').forEach(cardContainer => {
        if (!cardContainer.classList.contains('matched')) { // 如果卡片尚未匹配
            unmatchedCards.push(cardContainer);
        }
    });

    if (unmatchedCards.length >= 2) {
        // 从尚未配对的卡片中随机选择两张
        const card1 = unmatchedCards[Math.floor(Math.random() * unmatchedCards.length)];
        const card2 = unmatchedCards.find(card => 
            card !== card1 && card.querySelector('.card-back img').src === card1.querySelector('.card-back img').src
        );

        // 显示提示卡片（翻转）
        if (card1 && card2) {
            flipCard(card1);
            flipCard(card2);

            // 设置一个延迟，自动翻回去
            setTimeout(() => {
                flipCard(card1);
                flipCard(card2);
            }, 1000); // 1秒后翻回去
        }
    } else {
        alert('没有可提示的卡片！');
    }
}

// 翻转卡片的函数
function flipCard(cardContainer) {
    const card = cardContainer.querySelector('.card');
    cardContainer.classList.toggle('flip');
}

document.getElementById('hintButton').addEventListener('click', showHint);

// 統一翻到正面的按鈕功能
document.getElementById('flipToFront').addEventListener('click', function() {
    const cards = document.querySelectorAll('.card-container');
    cards.forEach(card => {
        card.classList.remove('flip'); // 移除 flip 類，統一翻到正面
    });
});

// 統一翻到背面的按鈕功能
document.getElementById('flipToBack').addEventListener('click', function() {
    const cards = document.querySelectorAll('.card-container');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('flip'); // 添加 flip 類，依序翻到背面
        }, index * 200); // 每張卡片延遲200毫秒依次翻轉
    });
});

// 開始遊戲按鈕功能
document.getElementById('startGame').addEventListener('click', function() {
    // 無論遊戲狀態如何，按下開始遊戲後都會重置遊戲
    clearInterval(countdownInterval); // 清除倒數計時
    clearInterval(gameTimerInterval); // 清除遊戲計時

    // 重置遊戲狀態
    gameStarted = true;
    matchedPairs = 0; // 重置配對計數
    flippedCards = []; // 清空翻轉的卡片

    // 重置遊戲時間顯示
    const timerDisplay = document.getElementById('timer');
    timerDisplay.textContent = `遊戲時間：0秒`;  // 重置遊戲時間為 0
    timerDisplay.style.display = 'block';  // 確保時間顯示出來

    // 啟用其他按鈕
    document.getElementById('flipToFront').disabled = false;
    document.getElementById('flipToBack').disabled = false;

    // 根據選擇的網格大小生成亂數卡片
    gridSize = parseInt(document.getElementById('gridSizeSelector').value);
    generateCards(currentTheme, gridSize);

    // 翻轉到背面
    const cards = document.querySelectorAll('.card-container');
    cards.forEach(card => {
        card.classList.add('flip'); // 全部翻到背面
    });

    // 根據下拉選單選擇的秒數進行倒數
    const selectedTime = parseInt(document.getElementById('timeSelector').value);
    startCountdown(selectedTime);
});

// 開始記錄遊戲花費的時間並顯示在頁面上
function startGameTimer() {
    gameStartTime = new Date().getTime();
    const timerDisplay = document.getElementById('timer'); // 顯示遊戲時間的元素
    timerDisplay.style.display = 'block'; // 確保顯示計時器

    gameTimerInterval = setInterval(() => {
        const currentTime = new Date().getTime();
        const timeSpent = Math.floor((currentTime - gameStartTime) / 1000);
        timerDisplay.textContent = `遊戲時間：${timeSpent}秒`;
    }, 1000); // 每秒更新遊戲時間
}

// 主題切換功能
document.getElementById('themeSelector').addEventListener('change', function() {
    currentTheme = this.value; // 更新當前主題
    gameStarted = false; // 重置遊戲狀態
    document.getElementById('flipToFront').disabled = true; // 禁用翻面按鈕
    document.getElementById('flipToBack').disabled = true;  // 禁用翻面按鈕
    document.getElementById('cardsWrapper').innerHTML = ''; // 清空卡片
    clearInterval(countdownInterval); // 清除倒數計時
    document.getElementById('countdown').style.display = 'none'; // 隱藏倒數
    document.getElementById('timer').style.display = 'none'; // 隱藏計時器
});
