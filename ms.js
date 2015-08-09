"use strict";
window.onload = function() {
    var clsbtns = document.querySelectorAll(".clsbtn");
    var navbtns = document.querySelectorAll(".navbtn");
    for(var c = 0, len = clsbtns.length; c < len; c++)
        addEvent(clsbtns[c], "click", closeMsg);
    addEvent(navbtns[0], "click", function(evt) {
        evt.preventDefault();
        var cls = Cells();
        createGame(cls.getSize(), cls.getMinesCount());
    });
    addEvent(navbtns[1], "click", function(evt) {
        evt.preventDefault();
        var cls = Cells();
        var oldsize = cls.getSize();
        var oldminescount = cls.getMinesCount();
        var msg = (oldsize < 18) ? "\nSize larger than 18 makes the game much more interesting." : "";
        var fs = prompt("Field size:" + msg, oldsize);
        msg = (Math.floor(fs * fs / 6.4) > oldminescount) ? "\n" + Math.floor(fs * fs / 6.4)  + " is better choice." : "";
        var mn = prompt("Mines amount:" + msg, oldminescount);
        saveSettingsToCookies(fs, mn);
        createGame(fs, mn);
    });
    addEvent(navbtns[2], "click", function(evt) {
        evt.preventDefault();
        document.querySelector("#rules").parentNode.className = "dim";
    });
    createGame();
};

// creation of the playing field
function createGame(fieldsize, minesnum) {
    if(!fieldsize) {
         var cook = getSettingsFromCookies();
         if(cook) {
              fieldsize = cook.fieldsize;
              minesnum = cook.mineCnt;
         }
    }
    if(!fieldsize || !minesnum) {
        fieldsize = 8; minesnum = 10;
    }

    fieldsize = parseInt(fieldsize);
    minesnum = parseInt(minesnum);
    if (!(fieldsize && minesnum && fieldsize > 0 && minesnum > 0)) {
        alert("Mission impossible!");
        return;
    }
    
    // cleans up after the last game
    var tble = document.querySelector("table");
    if(tble) {
        tble.parentNode.removeChild(tble);
        document.querySelector("#bear").className = "reg";
    }
    
    // prepare field for hardcore mode
    var hcenabled = document.getElementById("hardcoremode");
    var head = document.head || document.getElementsByTagName("head")[0];
    if (fieldsize > 9) {
        if (hcenabled) {
            head.removeChild(hcenabled);
        }
        var css = "table{width:" + fieldsize * 40 + "px;height:" + fieldsize * 40 + "px}body{width:auto}#top{width:382px;height:100px;background:url(minesweeper/sprites_s.png) 0 -80px}#bear{float:right}ul{display:block;float:right}td{width:40px;height:40px}.open{background:url(minesweeper/sprites_s.png) 0 0}.one{background:url(minesweeper/sprites_s.png) -40px 0}.two{background:url(minesweeper/sprites_s.png) -80px 0}.three{background:url(minesweeper/sprites_s.png) -120px 0}.four{background:url(minesweeper/sprites_s.png) -160px 0}.five{background:url(minesweeper/sprites_s.png) -200px 0}.six{background:url(minesweeper/sprites_s.png) 0 -40px}.seven{background:url(minesweeper/sprites_s.png) -40px -40px}.eight{background:url(minesweeper/sprites_s.png) -80px -40px}.mine{background:url(minesweeper/sprites_s.png) -120px -40px}.minexpl{background:url(minesweeper/sprites_s.png) -160px -40px}.close{background:url(minesweeper/sprites_s.png) -200px -40px}.flag{background:url(minesweeper/sprites_s.png) -440px -140px}";
        var hcstyle = document.createElement("style");
        hcstyle.id = "hardcoremode";
        hcstyle.type = "text/css";
        if (hcstyle.styleSheet) {
            hcstyle.styleSheet.cssText = css;
        } else {
            hcstyle.appendChild(document.createTextNode(css));
        }
        head.appendChild(hcstyle);
    } else {
        if (hcenabled) {
            head.removeChild(hcenabled);
        }
    }

    var loagindmsg = document.querySelector("#loading").parentNode;
    loagindmsg.className = "dim";
    var tbl = document.createElement("table");
    var tblBody = document.createElement("tbody");
    for(var r = 1, i = 0; r <= fieldsize; r++) {
        var tr = document.createElement("tr");
        for(var d = 1; d <= fieldsize; d++, i++) {
            var txt = document.createTextNode("\u0020");
            var td = document.createElement("td");
            td.id = "i" + i;
            td.appendChild(txt);
            tr.appendChild(td);
        }
        tblBody.appendChild(tr);
    }
    addEvent(tbl, "mousedown", bearwow);
    addEvent(tbl, "mouseup", bearreg);

    tbl.appendChild(tblBody);
    document.querySelector("#main").appendChild(tbl);
    linkDOMCells(fieldsize);
    genMines(minesnum);
    loagindmsg.className = "dim hide";
    var sfx = document.querySelector("#sfxbegin");
    sfx.currentTime = 0;
    sfx.play();
}

function bearwow() {
    document.querySelector("#bear").className = "wow";
}
function bearreg() {
    document.querySelector("#bear").className = "reg";
}

// Singleton
var Cells;
(function() {
    var instance;
    Cells = function Cells() {
        if(instance) {
            return instance;
        }
        instance = this;
        this._safeCellsCnt = 0;
        this._minecount = 0;
        this.setSize = function(fieldsize) {
            this._mcells = new Array(fieldsize);
        };
        this.getSize = function() {
            return this._mcells.length;
        };
        this.setMinesCount = function(minescount) {
            this._minecount = minescount;
        };
        this.getMinesCount = function() {
            return this._minecount;
        };
        this.addCells = function (tds) {
            var rowlen = this._mcells.length;
            for(var y = 0, c = 0, len = tds.length; c < len; y++) {
                var row = new Array(rowlen);
                for(var i = 0; i < rowlen; c++, i++) {
                    var xy = getXYfromCnt(c, rowlen);
                    row[i] = new Cell(xy[0], xy[1], tds[c]);
                    tds[c].className = "close";
                    addEvent(tds[c], "click", chkCell);
                    addEvent(tds[c], "contextmenu", function(evt) {
                      evt.preventDefault(); markFlagged(evt); });
                }
                this._mcells[y] = row;
            }
        };
        this.getCell = function (x, y){
            var len = this._mcells.length;
            if(x >= len || x < 0 || y >= len || y < 0) return false;
            return this._mcells[y][x];
        };
        this.safeCellsCntD = function () {
            this._safeCellsCnt--;
        };
    };
}());

function getRandomInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getXYfromCnt(cnt, fieldsize) {
    var y = cnt / fieldsize >> 0;
    var x = (y == 0) ? cnt : cnt % fieldsize;
    return new Array(x, y);
}

function Cell(x, y, link) {
    this._x = x;
    this._y = y;
    this._mine = false;
    this._open = false;
    this._link = link;
}

// make collection of cells, link DOM cells to Object Cells
function linkDOMCells(fieldsize) {
    var cls = new Cells();
    cls.setSize(fieldsize);
    var tds = document.querySelectorAll("td");
    cls.addCells(tds);
}

// generate mines on the playing field
function genMines(minesnum) {
    var cls = Cells();
    var rowlen = cls._mcells.length;
    if (minesnum > (rowlen * rowlen - 1)) {
        minesnum = rowlen * rowlen - 1;
    }
    cls.setMinesCount(minesnum);
    cls._safeCellsCnt = rowlen * rowlen - minesnum;
    cls._flagCnt = 0;
    while(minesnum != 0) {
        var rndx = getRandomInteger(0, rowlen - 1);
        var rndy = getRandomInteger(0, rowlen - 1);
        var cur = cls.getCell(rndx, rndy);
        if(!cur._mine) {
            cur._mine = true;
            minesnum --;
        }
    }
}

function getCellByIDorXY(evt, x, y) {
    var cls = Cells();
    if(x === undefined) {
        var xy = getXYfromCnt(parseInt(evt.target.id.slice(1)), cls._mcells.length);
        x = xy[0];
        y = xy[1];
    }
    return cls.getCell(x, y);
}

function markFlagged(evt, x, y) {
    var cls = Cells();
    var cur = getCellByIDorXY(evt, x, y);
    if(cur._open)
        return;
    if(cur._link.classList.contains("flag")) {
        cls._flagCnt--;
    }
    else {
        if(cls._minecount == cls._flagCnt)
            return;
        cls._flagCnt++;
    }
    cur._link.classList.toggle("flag");
}

// check a cell and its surroundings recursively
function chkCell(id, x, y) {
    var cls = Cells();
    if(x === undefined) {
        var xy = getXYfromCnt(parseInt(id.target.id.slice(1)), cls._mcells.length);
        x = xy[0];
        y = xy[1];
    }
    var cur = cls.getCell(x, y);
    if(cur != false) {
        if(cur._mine == true && id !== undefined) { gameover(x, y); return; }
        if(cur._open) return;
        else {
            if(cur._link.classList.contains("flag"))
                cls._flagCnt--;
            cur._open = true;
            cls.safeCellsCntD();
            if(cls._safeCellsCnt == 0) { cur._link.className = "open"; winner(); return; }
            var cntmines = 0;
            if(cls.getCell(x - 1, y - 1)._mine) cntmines++;
            if(cls.getCell(x, y - 1)._mine) cntmines++;
            if(cls.getCell(x + 1, y - 1)._mine) cntmines++;
            if(cls.getCell(x + 1, y)._mine) cntmines++;
            if(cls.getCell(x + 1, y + 1)._mine) cntmines++;
            if(cls.getCell(x, y + 1)._mine) cntmines++;
            if(cls.getCell(x - 1, y + 1)._mine) cntmines++;
            if(cls.getCell(x - 1, y)._mine) cntmines++;
            switch(cntmines) {
                case 1 : cur._link.className = "one"; break;
                case 2 : cur._link.className = "two"; break;
                case 3 : cur._link.className = "three"; break;
                case 4 : cur._link.className = "four"; break;
                case 5 : cur._link.className = "five"; break;
                case 6 : cur._link.className = "six"; break;
                case 7 : cur._link.className = "seven"; break;
                case 8 : cur._link.className = "eight"; break;
                default: {
                    chkCell(0, x - 1, y - 1);
                    chkCell(0, x, y - 1);
                    chkCell(0, x + 1, y - 1);
                    chkCell(0, x + 1, y);
                    chkCell(0, x + 1, y + 1);
                    chkCell(0, x, y + 1);
                    chkCell(0, x - 1, y + 1);
                    chkCell(0, x - 1, y);
                    cur._link.className = "open";
                    break;
                }
            }
        }
    }
    var sfx = document.querySelector("#sfxopen");
    sfx.currentTime = 0;
    sfx.play();
}

// end of a game, not very joyful end
function gameover(x, y) {
    var cls = Cells();
    var size = cls._mcells.length;
    for(var cx = 0; cx != size; cx++) {
        for(var cy = 0; cy != size; cy++) {
            var cl = cls.getCell(cx, cy);
            if(cl._mine) {
                if(cx == x && cy == y) cl._link.className = "minexpl";
                else cl._link.className = "mine";
            }
        }
    }
    removeAllEvents();
    var sfx = document.querySelector("#sfxminexpl");
    sfx.currentTime = 0;
    sfx.play();
    document.querySelector("#bear").className = "sad";
}

// end of a game, happy end
function winner() {
    removeAllEvents();
    var sfx = document.querySelector("#sfxwin");
    sfx.currentTime = 0;
    sfx.play();
    document.querySelector("#bear").className = "win";
}

function closeMsg(evt) {
    evt.preventDefault();
    evt.target.parentNode.parentNode.parentNode.className = "dim hide";
}

function addEvent(target, eventname, fnc) {
   document.addEventListener ?
        target.addEventListener(eventname, fnc, false) : target.attachEvent(eventname, fnc);
}

function removeAllEvents() {
    var tbl = document.querySelector("table");
    var cls = Cells();
    var size = cls._mcells.length;
    if(tbl.removeEventListener) {
        tbl.removeEventListener('mousedown', bearwow, false);
        tbl.removeEventListener("mouseup", bearreg, false);
        for(var cx = 0; cx != size; cx++) {
            for(var cy = 0; cy != size; cy++) {
                var cl = cls.getCell(cx, cy);
                cl._link.removeEventListener("click", chkCell, false);
                cl._link.removeEventListener("contextmenu", markFlagged, false);
            }
        }
    } else if(tbl.detachEvent) {
        tbl.detachEvent("mousedown", bearwow);
        tbl.detachEvent("mouseup", bearreg);
        for(var cx = 0; cx != size; cx++) {
            for(var cy = 0; cy != size; cy++) {
                var cl = cls.getCell(cx, cy);
                cl._link.detachEvent("click", chkCell);
                cl._link.detachEvent("contextmenu", markFlagged);
            }
        }
    }
}

function getSettingsFromCookies() {
    var cook = {};
    var cookTxt = document.cookie;
    var list = cookTxt.split(";");
    list.forEach(function(s) {
        var kv = s.split("=");
        var attr = kv[0].trim();
        var val = kv[1].trim();
        cook[attr] = val;
    });
    var expSoon = Date.now() + 15*24*60*60*1000;
    if(cook.mineexp && (expSoon > cook.mineexp))
        saveSettingsToCookies(cook.fieldsize, cook.mineCnt);
    return cook;
}

function saveSettingsToCookies(fieldsize, mineCnt) {
  if(!fieldsize || !mineCnt || (fieldsize > 100) || (mineCnt >= fieldsize * fieldsize))
    return;
  var exp = Date.now() + 30*24*60*60*1000;
  var dateExp = new Date(exp);
  var strExpire = dateExp.toGMTString();
  document.cookie = "mineCnt=" + mineCnt + ";expires=" + strExpire;
  document.cookie = "fieldsize=" + fieldsize + ";expires=" + strExpire;
  document.cookie = "mineexp=" + exp + ";expires=" + strExpire;
}
