"use strict"



function sheetTitle(what) { return "<th>" + what + "</th>" }


function getCls(timeOfDay) {
    let cls

    if (timeOfDay < 9) { cls = -1 }
    if (timeOfDay >= 9 && timeOfDay <= 12) { cls = timeOfDay - 9 }
    else if (timeOfDay > 12 && timeOfDay < 14) { cls = -1 }
    else if (timeOfDay >= 14 && timeOfDay <= 20) { cls = timeOfDay - 11 }
    else { cls = -1 }

    return cls
} 


function update() {
    let date = new Date()
    let day = date.getDay()
    if (--day < 0) { day = 6 }

    // 8-9 one, 9-10 two, 10-11 three, 11-12 four, 2-3 five, 3-4 six, ...
    let hour = date.getHours()
    let cls, nextCls

    // day = 1
    // hour = 10
    cls = getCls(hour)
    while (true) {
        hour++ 
        if (getCls(hour) != -1) {
            nextCls = {
                cls: getCls(hour),
                day: day
            }
            break
        }
        if (hour >= 24) { 
            hour = 0
            day++
            if (day >= 7) { day = 0 }
        }
    }
    
    let thisClsElem = document.querySelector("[day=\"" + day + "\"][cls=\"" + cls + "\"")
    let nextClsElem = document.querySelector("[day=\"" + nextCls.day + "\"][cls=\"" + nextCls.cls + "\"")
    const now = document.getElementById("now")
    
    nextClsElem.className = "grid"
    nextClsElem.classList.add("incoming")
    let current = ""
    if (cls == -1) {
        current = "在休息"
    } else {
        thisClsElem.className = "grid"
        thisClsElem.classList.add("current")
        current = "正在 " + thisClsElem.innerHTML + " 认真学习"
    }

    let result = "你现在 <b>" + current + "</b>"
    if (!isFree(nextClsElem.innerHTML)) {
        result += "，你的下一节课将会是 <b>" + nextClsElem.innerHTML + "</b>" 
    }
    else { 
        result += "，上完这节课 <b>没课！</b>" 
    }
    now.innerHTML = result
}


function isFree(text) {
    return (text == "没课" ||
            text == "休息" ||
            text == "明天要上课，早点睡吧")
}


setTimeout(function() {
    const schedule = document.getElementById("schedule")

    // there are seven days a week, and 9 classes each. So watch!
    let sheetBody = sheetTitle("周一") + sheetTitle("周二") + sheetTitle("周三") + sheetTitle("周四") + sheetTitle("周五") + sheetTitle("周六") + sheetTitle("周日")

    for (let cls = 0; cls < 10; cls++) {
        sheetBody += "<tr>"
        for (let day = 0; day < 7; day++) {
            sheetBody += "<td class=\"grid nope\" day=\"" + day + "\" cls=\"" + cls + "\">在查询</td>"
        }
        sheetBody += "</tr>"
    }
    
    schedule.innerHTML = sheetBody

    fetch("https://" + location.hostname + "/assets/data.json").then(function(resp) {
        resp.json().then(function(json) {
            for (let day = 0; day < 7; day++) {
                for (let cls = 0; cls < 10; cls++) {
                    let elem = document.querySelector("[day=\"" + day + "\"][cls=\"" + cls + "\"")
                    elem.className = "grid"
                    elem.innerHTML = json[day][cls]
                    if (isFree(json[day][cls])) {
                        elem.classList.add("nope")
                    }
                    if (json[day][cls].indexOf("毛泽东") != -1) {
                        elem.classList.add("red")
                    }
                }
            }
            update()
        })
    })
}, 2000)
