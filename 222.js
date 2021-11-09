// ==UserScript==
// @name         AutoFarm
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        *://trovo.live/*
// @match        *://google.io/*
// @match        *://cdn.trovo.live/*
// @grant        window.close
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addValueChangeListener
// ==/UserScript==
// || window.WebKitMutationObserver || window.MozMutationObserver

//let MutationObserver = window.MutationObserver;
//if (MutationObserver) console.dir("AutoFarm active");
//let observer = new MutationObserver((e) => {
let elixMin = 299;//299
let counElMin = 29;//19
let hMin = 8;
let hMax = 16;
let hMin2 = 18;
let hMax2 = 3;
let castSafe = 2;
let castFire = 1;
let blackList = [0];
let path = document.location.pathname;
let host = document.querySelector('use[*|href="#icon-host"]');
let streamerName = 0;
let secPlay, secTresure = 0;
let sendTimeOut = true;
let watchOld = -1;
let watchTime = 0;
//let Hour = new Date().getHours();
let timeStart = new Date().getTime();
let timeReload = new Date().getTime(); //время перезагрузки
console.dir(`Время: часы ${new Date().getHours()} таймстамп ${new Date().getTime()}`);
//let min = new Date().getMinutes();
//let sec = new Date().getSeconds();
//if (streamerAvatar.src.split('?', 1).join() !== user.src.split('?', 1).join()) {alert('1')} else {alert('2')}
const bc = new BroadcastChannel('channel');
bc.addEventListener('message', function(event) {
    //debugger
    if (event.data == 2) {
        bc.postMessage(`${streamerName}`);
    }
    if (blackList.indexOf(event.data) == -1){
        blackList.splice(0,0,event.data);
        bc.postMessage(`${streamerName}`);
        console.dir(`добавлен элемент ${event.data} в список ${blackList}`);
    } else {console.dir(`элемент ${event.data} уже есть в списоке ${blackList}`);}
});
//----------------------------------------------------------------------------CDN
if (document.location.hostname === "cdn.trovo.live") {
    startCDN();
    console.dir(`Найден фрейм`);
    function startCDN() {
        setTimeout(() => {
            if (document.querySelector('.box-wrap')) {
                streamerName = document.querySelector('.box-wrap > div > div > span> span')?.innerText;
            } else {
                if (document.querySelector('p.nickname')) {
                    streamerName = document.querySelector('p.nickname')?.innerText;
                } else {
                    console.dir(`Канал не определен`);
                }
            }
            console.dir(`Окно ${streamerName} включено, список: ${blackList}`);
            bc.postMessage(`2`);
            generalCDN();
        }, Math.random() * 1000 + 5000);
    }
}
//-------------------------------------------------------------------ОСНОВНАЯ CDN
function generalCDN() {
    setTimeout(() => {
        let boxNum = parseInt(document.querySelector(".box-num")?.textContent.match(/\d+/g)[0]);
        let price = parseInt(document.querySelector(".price")?.textContent.match(/\d+/g)[0]);
        let priceElix = document.querySelector(".price")?.textContent.includes("Elixir");
        let area = document.querySelectorAll(".condition-wrap > ul > li");
        if (area.length > 0) {
            //debugger
            let doneConfirm = new Array(area.length).fill(0);
            //doneConfirm.forEach((e,i) =>doneConfirm[i]=0)
            for (let i = 0; i < area.length; i++) {
                if (area[i].querySelector(".task-desc")?.textContent.includes("Watch")) {
                    let watch = area[i].querySelector(".process");
                    if (watchTime < (new Date().getTime())) {
                        let watchNow = parseInt(watch.textContent.match(/\d+/g)[0]);
                        let watchAll = parseInt(watch.textContent.match(/\d+/g)[1]);
                        if (watchOld < watchNow) {
                            console.dir(`Время идет, обновляем ${watchOld} на ${watchNow} из ${watchAll}`);
                            watchTime = new Date().getTime() + 3*60*1000;
                            watchOld = watchNow;
                            if (watch && sendTimeOut) {
                                window.parent.postMessage({message: "timeOut",time: ((watchAll-watchNow) < 0 ? 0 : (watchAll-watchNow))}, "*");
                                console.dir(`Найден элемент Вотч, просмотренно ${watchNow} из ${watchAll}`);
                                //sendTimeOut = false;
                            }
                        } else {
                            console.dir(`Время не идет ${watchOld}/${watchNow}, открываем следующий сундук`);
                            nextTresure();
                        }
                    }
                }
                if (area[i].classList == "gift-times") {
                    doneConfirm[i] = 1;
                    nextTresure();
                }
                let done = area[i].querySelector("button");
                if (done) {
                    if (done?.textContent?.indexOf("Done") !== -1) {
                        doneConfirm[i] = 1;
                    }
                    if (done.disabled) {
                        doneConfirm[i] = 1;
                    } else {
                        if ((done.textContent.indexOf("Send") !== -1)||(done.textContent.indexOf("Отправить") !== -1)) {
                            console.dir(`Нажимаем Send/Отправить`);
                            done.click();
                            //win.postMessage("clickSend", "*");
                            window.parent.postMessage({message: "clickSend"}, "*");
                        }
                        if ((done.textContent.indexOf("Follow") !== -1)||(done.textContent.indexOf("Отслеживать") !== -1)) {
                            console.dir(`Нажимаем Follow/Отслеживать`);
                            done.click();
                        }
                        if ((done.textContent.indexOf("Share") !== -1)||(done.textContent.indexOf("Поделиться") !== -1) ) {
                            console.dir(`Нажимаем Share/Поделиться`);
                            done.click();
                        }
                        if ((done.textContent.indexOf("Cast") !== -1)||(done.textContent.indexOf("Cast") !== -1) ) {
                            if ((area[i].querySelector(".process")?.innerText.includes("Safe")) &&
                                (parseInt(area[i].querySelector(".process")?.textContent.match(/\d+/g) ?? 0) < 3)) {
                                //area[i].querySelector(".process")?.textContent.match(/\d+/g);
                                done.click();
                                //win.postMessage("CastSafe", "*");
                                window.parent.postMessage({message: "CastSafe"}, "*");
                            } else if ((area[i].querySelector(".process")?.innerText.includes("You got this!")) &&
                                       (parseInt(area[i].querySelector(".process")?.textContent.match(/\d+/g) ?? 0) < 3)) {
                                done.click();
                                window.parent.postMessage({message: "youGotThis"}, "*");
                            } else if ((area[i].querySelector(".process")?.innerText.indexOf("On Fire") !== -1) &&
                                       (parseInt(area[i].querySelector(".process")?.textContent.match(/\d+/g) ?? 0) < 2)){
                                if(priceElix && price > 99 && price*boxNum > 999) {
                                    nextTresure(); //!!!!!!!убрать после тестов!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                                    done.click();
                                    window.parent.postMessage({message: "CastFire"}, "*");
                                } else {
                                    nextTresure();
                                }
                            } else {
                                nextTresure();
                            }
                        }
                    }
                }
                console.dir(`элемент ${i+1} равен ${doneConfirm[i]}`);
            }
            if (doneConfirm.every(elem => elem === 1)) {
                nextTresure();
            }
        }
        let ended = document.querySelector(".progress-tip");
        if (ended?.textContent.includes("event has ended")){
            nextTresure();
        }
        let failText = document.querySelector(".fail-text");
        if (failText?.textContent.includes("nothing left")){
            nextTresure();
        }
        generalCDN();
    }, Math.random() * 1000 + 10000);
}
//-----------------------------------------------------------------СЛЕДУЮЩИЙ СУНДУК
function nextTresure() {
    console.dir(`ищем следующий сундук`);
    let back = document.querySelector(".icon-back");
    if (back) {
        back.dispatchEvent(new Event('click'));
    }
    setTimeout(() => {
        document.querySelector(".ui-loadMore-content.vb-content").scrollTo(0, 950);
        setTimeout(() => {
            document.querySelector(".ui-loadMore-content.vb-content").scrollTo(0, 9999960);
            setTimeout(() => {
                document.querySelector(".ui-loadMore-content.vb-content").scrollTo(0, 9999960);
                setTimeout(() => {
                    document.querySelector(".ui-loadMore-content.vb-content").scrollTo(0, 9999960);
                }, Math.random() * 1000 + 2000);
            }, Math.random() * 1000 + 2000);
        }, Math.random() * 1000 + 2000);
    }, Math.random() * 1000 + 200);
    setTimeout(() => {
        let card = document.querySelectorAll(".ui-loadMore-content.vb-content > ul:last-of-type > li");
        if (card.length > 0) {
            document.querySelector(".ui-loadMore-content.vb-content").scrollTo(0, 10000);
            for (let i = 0; i < card.length; i++) {
                //card = document.querySelectorAll(".ui-loadMore-content.vb-content > ul:last-of-type > li");
                //gift = card[1].querySelector(".gift-name");
                console.dir(`проверка сундука ${i} из ${card.length}`);
                let name = card[i].querySelector(".nick-name")?.innerText;
                let gift = card[i].querySelector(".gift-name");
                let boxes = card[i].querySelector(".text-brand");
                let giftCount = parseInt(gift.textContent.match(/\d+/));
                let boxesCount = parseInt(boxes.textContent.match(/\d+/));
                // Shiny Uni / EZ / Winner / Bravo! / HYPE / Rose / Leon Lime /
                if ((gift.textContent.indexOf("Super Good") !== -1 || gift.textContent.indexOf("Top1") !== -1||
                     gift.textContent.indexOf("GGWP") !== -1 || gift.textContent.indexOf("Cash Bang") !== -1 ||
                     gift.textContent.indexOf("Steak") !== -1) ||
                    ((gift.textContent.indexOf("Elixir") !== -1) && giftCount*boxesCount > elixMin && giftCount > counElMin)) {
                    console.dir(`сундук найден`);
                    //debugger
                    if (blackList.indexOf(name) == -1){
                        console.dir(`сундук НЕ в черном списке`);
                        gift.click();
                        i = card.length + 1;
                        window.parent.close();
                        break;
                    }
                } else {console.dir(`сундук слишком дешевый, ${giftCount} элексира в количестве ${boxesCount}`);}
                if (i+1 == card.length ){
                    console.dir(`не найден сундук по условиям ищу любой`);
                    elixMin = 1;
                    counElMin = 1;
                    i = 0;
                    //alert(`нету нужных сундуков ищу любой`);
                }
            }
        } else {console.dir(`нету списка сундуков`);}
    }, Math.random() * 1000 + 10000);
}
//-------------------------------------------------------------------------------TROVO
if (document.location.hostname === "trovo.live") {
    startTrovo();
    console.dir(`Найдено окно трово`);
    function startTrovo() {
        setTimeout(() => {
            //if (document.location.pathname.includes("AlexDos") || document.location.pathname.includes("DmitriyD") ||
            //    document.location.pathname.includes("00astral") || document.location.pathname.includes("1Sergey")) {
            if (document.querySelector('.icon-edit')) {
                console.dir(`Родная страница`)
            } else {
                if(document.querySelector('#base_iframe')){
                    console.dir(`Найдено окно фрейма!`);
                } else {
                    console.dir(`Не найдено окно фрейма!!!!!!!!!!!!!!`);
                    if (!document.location.pathname.includes("trovo")) {
                        if (document.querySelector('.player-video') && location.search.includes('treasureDetail')) {
                            let aTemp = document.createElement('a');
                            aTemp.target= '_blank';
                            aTemp.href= location.href;
                            aTemp.click();
                            window.close();
                        } else {
                            window.open("http://trovo.live/trovo");
                            window.close();
                        }
                    }
                    //window.open(location.href);
                    //win = window.open("about:blank");
                    //win.location.href = "https://trovo.live/ROHIEL?aid=100315624&atype=treasureDetail"
                }
                if (document.querySelector('.streamer-name')) {
                    streamerName = document.querySelector('.streamer-name')?.innerText;
                } else {
                    console.dir(`Канал не определен, это главное окно БЕДА`);
                }
                console.dir(`Канал ${streamerName} включен, список: ${blackList}`);
                bc.postMessage(`2`);
                let H = new Date().getHours()
                if ((H > hMin && H < hMax) || H > hMin2 || H < hMax2) {
                    console.dir(`ЗАПУСК`);
                    generalTrovo();
                } else {
                    console.dir(`Время активности не пришло`);
                    window.open("http://google.io");
                    window.close();
                }
            }
        }, Math.random() * 5000 + 10000);
    }
    //--------------------------ДОЛГОЕ НАХОЖДЕНИЕ НА СТРАНИЦЕ
    setTimeout(() => {
        console.dir(`очень долго тут находимся`);
        window.open("http://trovo.live/trovo");
        window.close();
        //location.href=location.href;
        //location.reload();
        aaa();
        function aaa() {
            setTimeout(() => {
                let frame1 = document.querySelector('#base_iframe');
                if (frame1) {
                    let close = frame1.querySelector('.iframe_icon_');
                    //close.click();
                    close.dispatchEvent(new Event('click'));
                }
                aaa();
                next();
            }, Math.random() * 30*1000 + 30*1000);
        }
    }, Math.random() * 60*1000 + 60*60*1000);
}
//-------------------------------------------------------------------ОСНОВНАЯ TROVO
function generalTrovo() {
    setTimeout(() => {
        if (document.querySelector("#restoreAll")) {
            console.dir(`Вкладки упали`);
            document.querySelector("#restoreAll")?.click();
        }
        //console.dir(`Время перезагрузки ${timeStart} ${timeReload*60*1000+2*60*1000} ${timeStart +
        //timeReload*60*1000} ${(new Date().getTime())}`);
        if ((timeReload + 4*60*1000) < (new Date().getTime())) {
            console.dir(`Время старта ${timeStart} таймаут${timeReload*60*1000} перезагрузка в${timeStart +
                        timeReload*60*1000} сейчас${(new Date().getTime())}`);
            console.dir(`Вышло время ожидания перезагрузки`);
            window.open("http://trovo.live/trovo");
            window.close();
        }
        //let streamerAvatar = document.querySelector('.streamer-wrap > div > img');
        //let user = document.querySelector('.uinfo-wrapper > div:last-child img');
        //console.dir(`находимся на ${streamerAvatar?.src.split('?', 1).join()}, юзер: ${user?.src.split('?', 1).join()}`);
        if (document.querySelector(".ml5.offline") || document.querySelector(".ml5.host")) {
            //if (streamerAvatar.src.split('?', 1).join() !== user.src.split('?', 1).join()) {}
            console.dir(`Страница офлайн или ретрансляция, ищем следующий сундук`);
            next();
        }
        if (document.querySelector(".chat-send-tip-text")) {
            if ((document.querySelector(".chat-send-tip-text")?.textContent.includes("Subscriber-only Chat")) ||
                (document.querySelector(".chat-send-tip-text")?.textContent.includes("Чат только для подписчиков"))) {
                //console.dir(`Сабскрайб онли`);
                if (!document.querySelector(".btn-send").disabled) {
                    console.dir(`Сабскрайб онли и кто то пробует отправить сообщение, ищем следубщий сундук`);
                    next();
                }
            }
        }
        if (!document.querySelector('[name="iframe_dialog_"]') && ((new Date().getTime()) > secTresure + 2*60*1000)) {
            console.dir(`Не найдено окно сундука`);
            if (!document.querySelector('[name="iframe_dialog_"]') && secTresure > 0) {
                //next();
            }
            secTresure = new Date().getTime();
        }
        let mute = document.querySelector('div.vcp-volume-muted');
        if (!mute) {
            console.dir(`Заглушаем звук`);
            document.querySelector('div.vcp-volume > .vcp-volume-icon')?.click();
        }
        let adult = document.querySelector('.eighteen-wrap .ctn-right .primary');
        if (adult) {
            console.dir(`жмем кнопку начать просмотр`);
            adult.click();
        }
        let clarity = document.querySelector('div.vcp-clarityswitcher');
        if (clarity) {
            //console.dir(`Найдено качество`);
            let clarity1080 = clarity.querySelector('use[*|href="#icon-1080P"]'); //#icon-360P
            if (clarity1080){
                console.dir(`Найдено качество 1080`);
                //let a = clarity.querySelector('.clarity-icon');
                clarity.querySelector('.clarity-icon').dispatchEvent(new Event('click'));
                setTimeout(() => {
                    let clarityLast = document.querySelector('.v-clarity-switcher .menu > div >p:last-of-type');
                    clarityLast.click();
                }, Math.random() * 1000 + 5000);
            }
        }
        let play = document.querySelector(".cat-button.btn");
        if (play && ((new Date().getTime()) > secPlay + 30000)) {
            console.dir(`Проигрыватель на паузе, жмем плей`);
            secPlay = new Date().getTime();
            play.click();
        }
        let rule = document.querySelector(".chat-rule-panel > div > button");
        if (rule) {
            console.dir(`Жмем принять правила чата`);
            rule.click();
        }
        let share = document.querySelector(".share-platforms > div:nth-child(3)");
        if (share) {
            console.dir(`Жмем поделиться`);
            share.click();
        }
        let recon = document.querySelector (".reconnect > button")
        if (recon) {
            console.dir(`Жмем перезагрузить проигрыватель`);
            recon.click();
        }
        generalTrovo();
    }, Math.random() * 1000 + 10000);
}
//------------------------------------------------------------СЛЕДУЮЩИЙ СУНДУК
function next(){
    if (document.querySelector('.icon-edit')) {
        console.dir('Родная страница');
    } else {
        //debugger
        let frame = document.querySelector('[name="iframe_dialog_"]')
        if (frame) {
            let winPop = frame.contentWindow;
            if (winPop) {
                console.dir(`при попытки найти следующую коробку окно найдено`);
                winPop.postMessage({message: "next"}, "*");
            }
        } else {
            console.dir(`при попытки найти следующую коробку окно НЕ найдено`);
            document.querySelector('img[src*="b420513"]')?.click(); //иконка расширений трово
            setTimeout(() => {
                document.querySelector('img[src*="20201120"]')?.click(); //иконка treasure box
            }, Math.random() * 1000 + 10000);
        }
        //let win1 = frames['iframe_dialog_'] // не работает?
        //let winPop = frames.iframe_dialog_; // не работает?
        //let winPop = window.frames[0];
    }
}
//-------------------------------------------------------------------------GOOGLE
if (document.location.hostname === "google.io") {
    startGoogle();
    console.dir(`Найден ГУГЛ`);
    function startGoogle() {
        setTimeout(() => {
            let H = new Date().getHours()
            if ((H > hMin && H < hMax) || H > hMin2 || H < hMax2) {
                window.open("http://trovo.live/trovo");
                window.close();
            } else {
                console.dir(`Время активности не пришло`);
                console.dir(`Время: часы ${new Date().getHours()} таймстамп ${new Date().getTime()}`);
                setTimeout(() => {
                    startGoogle();
                }, Math.random() * 30*1000 + 20*60*1000);
            }
        }, Math.random() * 1000 + 30000);
    }
}

//-----------------------------------------------------------------------ЭВЕНТЫ
window.addEventListener('message', function(event) {
    //debugger
    //console.dir(event.data.message);
    if (event.data.message == "next") {
        console.dir("Страница офлайн, вызываем следующую");
        //alert();
        let back = document.querySelector(".icon-back");
        if (back) {
            back.dispatchEvent(new Event('click'));
        }
        setTimeout(() => {
            let nick = document.querySelector(".nick-name");
            if (nick) {
                nick.click();
                window.parent.close();
            }
        }, Math.random() * 1000 + 10000);
    }
    //window.parent.postMessage({message: "timeOut",time: 60}, "*");
    if (event.data.message == "timeOut") {
        //timeReload = event.data.time;
        timeReload = new Date().getTime();
        console.dir(`Время перезагрузки ${timeReload} таймаут ${event.data.time} перезагрузка в ${timeReload + event.data.time*4*60*1000}`);
    }
    if (event.data.message == "clickSend") {
        console.dir("Принято сообщение в чат");
        let chatFollow = document.querySelector(".cat-button.ml10");
        if (chatFollow) {
            chatFollow.click();
        }
        let chatSend = document.querySelector(".btn-send");
        if (chatSend) {
            chatSend.click();
        }
        setTimeout(() => {
            chatFollow = document.querySelector(".cat-button.ml10");
            if (chatFollow) {
                chatFollow.click();
            }
            chatSend = document.querySelector(".btn-send");
            if (chatSend) {
                chatSend.click();
            }
        }, Math.random() * 1000 + 1000);
        //let send = document.querySelector(".btn-send");
        //send.click()
    }
    if (event.data.message == "CastFire") {
        if (castFire > 0 ) {
            castFire--;
            setTimeout(() => {
                console.dir("Кастуем Fire");
                //debugger;
                let bag = document.querySelector(".bag")?.parentElement;
                if (bag) {
                    let bagP = Array.prototype.slice.call(bag.querySelectorAll("p"));
                    let bagFire = bagP.filter((e) => e.textContent === "Confetti")[0]; //On Fire //Confetti
                    if (bagFire) {
                        console.dir(`Кастуем Fire в сумке`);
                        let buttonFire = Array.prototype.slice.call(bagFire.parentElement.children).filter((e) => e.tagName === "BUTTON")[0];
                        console.dir(buttonFire);
                        //buttonFire.click();
                        next();
                    } else {
                        console.dir(`Отсутствует Fire в сумке`);
                        next();
                    }
                } else {console.dir(`Не открыт Cast Spell`);}
            }, Math.random() * 1000 + 5000);
        }
    }
    if (event.data.message == "CastSafe") {
        if (castSafe > 0 ) {
            castSafe--;
            setTimeout(() => {
                console.dir("Кастуем Safe");
                //debugger;
                //let giftBox = document.querySelector(".gift-box");
                if (!document.querySelector(".gift-box")) {
                    document.querySelector(".cast-btn")?.click();
                }
                setTimeout(() => {
                    let gift520010002 = document.querySelector("#gift_520010002");
                    if (gift520010002) {
                        let pTag = Array.prototype.slice.call(gift520010002.querySelectorAll("p"));
                        let pSafe = pTag.filter((e) => e.textContent === "Stay Safe")[0];
                        //pTag = Array.prototype.slice.call(document.querySelectorAll("*"));
                        //pSafe = pTag.filter((e) => e.textContent.indexOf('Safe') !== -1);
                        //stay = pSafe.filter((e) => e.children.length == 0)[0];
                        //другой вариант
                        //pTag = Array.prototype.slice.call(document.querySelectorAll("*:not(script)"));
                        //XXX = pTag.filter(e=>Array.prototype.slice.call(e.childNodes).filter(e=>e.nodeName == "#text")
                        //.filter(e=>e.textContent.indexOf('XXX') !== -1).length > 0)
                        let buttonSafe = Array.prototype.slice.call(pSafe.parentElement.children).filter((e) => e.tagName === "BUTTON")[0];
                        console.dir(buttonSafe);
                        buttonSafe.click();
                    } else {console.dir("Что то пошло не так с поиском Safe");}
                }, Math.random() * 1000 + 5000);
            }, Math.random() * 1000 + 5000);
        }
    }
    if (event.data.message == "youGotThis") {
        if (castSafe > 0 ) {
            castSafe--;
            setTimeout(() => {
                console.dir("Кастуем you Got This");
                if (!document.querySelector(".gift-box")) {
                    document.querySelector(".cast-btn")?.click();
                }
                setTimeout(() => {
                    let gift520004007 = document.querySelector("#gift_520004007");
                    if (gift520004007) {
                        let pTag = Array.prototype.slice.call(gift520004007.querySelectorAll("p"));
                        let pSafe = pTag.filter((e) => e.textContent === "You got this!")[0];
                        let buttonSafe = Array.prototype.slice.call(pSafe.parentElement.children).filter((e) => e.tagName === "BUTTON")[0];
                        console.dir(buttonSafe);
                        buttonSafe.click();
                    } else {console.dir("Что то пошло не так с поиском you Got This");}
                }, Math.random() * 1000 + 5000);
            }, Math.random() * 1000 + 5000);
        }
    }
});
//});
//observer.observe(document.body, { childList: true, subtree: true });
