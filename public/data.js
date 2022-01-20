window.onload = function () {

  window.call().then(({ data }) => {
    let tagBall = window.document.getElementById('tagBall')
    let items = ''
    for (var i = 0; i < data.length; i++) {
      items += `<a class="tag" href="#" onclick="onClick(this, 'https://${data[i].msg_url}')">
        <span>${data[i].name}</span>
        <div class="voice">
            <div class="bg"></div>
        </div>
      </a>`
    }
    tagBall.innerHTML = items

    var tagEle = "querySelectorAll" in document ? document.querySelectorAll(".tag") : getClass("tag"),
      paper = "querySelectorAll" in document ? document.querySelector(".tagBall") : getClass("tagBall")[0];
    RADIUS = 400,
      fallLength = 1024,
      tags = [],
      angleX = Math.PI / 1024,
      angleY = Math.PI / 1024,
      CX = paper.offsetWidth / 2,
      CY = paper.offsetHeight / 2,
      EX = paper.offsetLeft + document.body.scrollLeft + document.documentElement.scrollLeft,
      EY = paper.offsetTop + document.body.scrollTop + document.documentElement.scrollTop,
      
    function getClass(className) {
      var ele = document.getElementsByTagName("*");
      var classEle = [];
      for (var i = 0; i < ele.length; i++) {
        var cn = ele[i].className;
        if (cn === className) {
          classEle.push(ele[i]);
        }
      }
      return classEle;
    }

    function init() {
      for (var i = 0; i < tagEle.length; i++) {
        var a, b;
        var k = -1 + (2 * (i + 1) - 1) / tagEle.length;
        var a = Math.acos(k);
        var b = a * Math.sqrt(tagEle.length * Math.PI);
        var x = RADIUS * Math.sin(a) * Math.cos(b);
        var y = RADIUS * Math.sin(a) * Math.sin(b);
        var z = RADIUS * Math.cos(a);
        var t = new tag(tagEle[i], x, y, z);
        // tagEle[i].style.color = "rgb(" + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + "," + parseInt(Math.random() * 255) + ")";
        tags.push(t);
        t.move();
      }
    }
    Array.prototype.forEach = function (callback) {
      for (var i = 0; i < this.length; i++) {
        callback.call(this[i]);
      }
    }

    function animate() {
      setInterval(function () {
        rotateX();
        rotateY();
        tags.forEach(function () {
          this.move();
        })
      }, 17)
    }
    if ("addEventListener" in window) {
      paper.addEventListener("mousemove", function (event) {
        var x = event.clientX - EX - CX;
        var y = event.clientY - EY - CY;
        angleY = x * 0.0001;
        angleX = y * 0.0001;
      });
    } else {
      paper.attachEvent("onmousemove", function (event) {
        var x = event.clientX - EX - CX;
        var y = event.clientY - EY - CY;
        angleY = x * 0.0001;
        angleX = y * 0.0001;
      });
    }

    function rotateX() {
      var cos = Math.cos(angleX);
      var sin = Math.sin(angleX);
      tags.forEach(function () {
        var y1 = this.y * cos - this.z * sin;
        var z1 = this.z * cos + this.y * sin;
        this.y = y1;
        this.z = z1;
      })

    }

    function rotateY() {
      var cos = Math.cos(angleY);
      var sin = Math.sin(angleY);
      tags.forEach(function () {
        var x1 = this.x * cos - this.z * sin;
        var z1 = this.z * cos + this.x * sin;
        this.x = x1;
        this.z = z1;
      })
    }
    var tag = function (ele, x, y, z) {
      this.ele = ele;
      this.x = x;
      this.y = y;
      this.z = z;
    }
    tag.prototype = {
      move: function () {
        // if (playStatus !== 'end') return;

        var scale = fallLength / (fallLength - this.z);
        var alpha = (this.z + RADIUS) / (2 * RADIUS);
        this.ele.style.fontSize = 1 * scale + "rem";
        this.ele.style.opacity = alpha + 0.5;
        this.ele.style.filter = "alpha(opacity = " + (alpha + 0.5) * 100 + ")";
        this.ele.style.zIndex = parseInt(scale * 100);
        this.ele.style.left = this.x + CX - this.ele.offsetWidth / 2 + "px";
        this.ele.style.top = this.y + CY - this.ele.offsetHeight / 2 + "px";

        var voice = this.ele.querySelectorAll(".voice")[0];
        if (voice) {
          voice.style.paddingTop = 10 * scale + "px";
          voice.style.paddingLeft = 10 * scale + "px";
          voice.style.width = 85 * scale + "px";
          voice.style.height = 20 * scale + "px";
          var bg = voice.querySelectorAll(".bg")[0];
          bg.style.width = 20 * scale + "px";
          bg.style.height = 20 * scale + "px";
        }
        var avatar = this.ele.querySelectorAll(".avatar")[0];
        if (avatar) {
          avatar.style.width = 15 * scale + "px";
          avatar.style.height = 15 * scale + "px";
          avatar.style.borderRadius = 10 * scale + "px";
        }
      }
    }
    init();
    animate();

  })
}

window.call = function () {
  return new Promise((resolve) => {
    window.fetch('./voice', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(response => response.text())
      .then(result => resolve(JSON.parse(result)))
      .catch(error => {
        console.error(error)
        resolve(false)
      })
  })
}
