function my$(selector) {
    if (typeof selector !== 'string' || selector === '') return;
    return document.querySelector(selector);
}


function my$$(selector) {
    if (typeof selector !== 'string' || selector === '') return;
    return document.querySelectorAll(selector);
}


function showLoader() {
    //console.log('showLoader');
    loading = true;
    my$('.loader').style.display = 'block';
}


function hideLoader() {
    //console.log('hideLoader');
    loading = false;
    my$('.loader').style.display = 'none';
}


function uploadLogfile() {
    //var filename = my$('form')['file'].value;
    var logfile = my$('#file').files[0];
    if(logfile === undefined) {
        alert("Select a log or txt file");
        return;
    }

    var parts = logfile.name.split('.');
    var filetype = parts[parts.length - 1];
    if(['log', 'txt'].indexOf(filetype) == -1) {
        alert("Select a log or txt file");
        return;
    }

    my$('form').submit();
    showLoader();
}


function parseQueryString(url) {
    // history.pushState(null, '', '/scrapyd/');
    var urlParams = {};
    url.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
            urlParams[$1] = $3;
        }
    );
    return urlParams;
}


function setDaemonstatus(node_name, pending, running, finished) {
    if (node_name == '?') {
        my$('#nav_daemonstatus').style.color = 'red';
    } else {
        my$('#nav_daemonstatus').style.color = 'black';
    }
    my$('#nav_node_name').innerText = node_name;
    my$('#nav_pending').innerText = pending;
    my$('#nav_running').innerText = running;
    my$('#nav_finished').innerText = finished;
}


var refresh_daemonstatus_fail_times = 0;
function refreshDaemonstatus(url_daemonstatus) {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var obj = JSON.parse(this.responseText);
                if(obj.status == 'ok') {
                    refresh_daemonstatus_fail_times = 0;
                    setDaemonstatus(obj.node_name, obj.pending, obj.running, obj.finished);
                } else {
                    refresh_daemonstatus_fail_times += 1;
                    setDaemonstatus('?', '?', '?', '?');
                    //if(refresh_daemonstatus_fail_times >= 3 && refresh_daemonstatus_fail_times % 3 == 0){
                        //alert('FAIL to refresh daemonstatus, check '+obj.url);
                    //    if (window.confirm("FAIL to refresh daemonstatus, open a new tab for details?")) {
                    //        var win = window.open(obj.url, '_blank');
                    //        win.focus();
                    //    }
                    //}
                }
            } else {
                refresh_daemonstatus_fail_times += 1;
                setDaemonstatus('?', '?', '?', '?');
                //if(refresh_daemonstatus_fail_times >= 3 && refresh_daemonstatus_fail_times % 3 == 0){
                //    alert("FAIL to refresh daemonstatus, status code is "+this.status+", check the log of ScrapydWeb");
                //}
            }
        }
    };
    req.open("post", url_daemonstatus, Async = true);
    req.send();
}



//https://tuhrig.de/basic-auth-log-out-with-javascript/
//Basic Auth log-out with JavaScript
function logout() {

	// To invalidate a basic auth login:
	//
	// 	1. Call this logout function.
	//	2. It makes a GET request to an URL with false Basic Auth credentials
	//	3. The URL returns a 401 Unauthorized
	// 	4. Forward to some "you-are-logged-out"-page
	// 	5. Done, the Basic Auth header is invalid now

    // Added by llx
    document.querySelector('html').innerHTML = "";
    refresh_daemonstatus = false;

	jQuery.ajax({
            type: "GET",
            url: "/",
            async: false,
            username: "logmeout",
            password: "123456",
            headers: { "Authorization": "Basic xxx" }
	})
	.done(function(){
	    // If we don't get an error, we actually got an error as we expect an 401!
	})
	.fail(function(){
	    // We expect to get an 401 Unauthorized error! In this case we are successfully
            // logged out and we redirect the user.
	    window.location = "/";
    });

    return false;
}


function checkLatestVersion(page_view, SCRAPYDWEB_VERSION, GITHUB_URL) {
    console.log('checkLatestVersion');
    //In case navigate back from Github but show window.confirm() again
    var open_github = true;
    if(window.localStorage) {
        if(localStorage.getItem('github') == null) {
            open_github = true;
            localStorage.setItem('github', 'opened');
        } else {
            open_github = false;
            localStorage.removeItem('github');
        }
    }
    console.log(open_github);
    console.log('github: ' + localStorage.getItem('github'));

    if(open_github && typeof(latest_version) !== 'undefined') {
        console.log(latest_version);
        if(latest_version != SCRAPYDWEB_VERSION) {
            console.log(update_info);
            //alert(update_info);
            if (window.confirm(update_info)) {
                //var win = window.open(GITHUB_URL + "/blob/master/HISTORY.md", '_blank');
                //win.focus();
                window.location = GITHUB_URL + "/blob/master/HISTORY.md";
            }
        }
        else if(page_view == 1) {
            if (window.confirm("Would you like to STAR and help improve ScrapydWeb?")) {
                //var win = window.open(GITHUB_URL, '_blank');
                //win.focus();
                window.location = GITHUB_URL;
            }
        }
    }
}


//https://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome/13348618#13348618
//https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
function checkBrowser() {
    //alert(navigator.userAgent);
    // 'iPad' NOT included
    if( /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        var r = confirm("Mobile device detected, switch to mobile UI?");
        if(r == true) {
            window.location.href = "/?ui=mobile";
            return;
        }
    }
    var isChromium = window.chrome;
    var winNav = window.navigator;
    var vendorName = winNav.vendor;
    var isOpera = typeof window.opr !== "undefined";
    var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    var isFirefox = winNav.userAgent.indexOf("Firefox") > -1;
    var isSafari = winNav.userAgent.indexOf("Safari") > -1 && winNav.userAgent.indexOf("Chrome") == -1;
    var isIOSChrome = winNav.userAgent.match("CriOS");

    //if (isIOSChrome) {
        // is Google Chrome on IOS
    if(
        isChromium !== null &&
        typeof isChromium !== "undefined" &&
        vendorName === "Google Inc." &&
        isOpera === false &&
        isIEedge === false
    ) {
        console.log('Google Chrome');
    } else {
        alert("It's recommended to use Google Chrome to get the best experience.");
    }
}


function dashboardXHR(url, forcestop, id) {
    console.log('forcestop: '+forcestop);
    console.log('id: '+id);
    if(forcestop == true) {
        var r = confirm("Force unclean shutdown?");
        if(r == false) {
            return;
        }
    }
    showLoader();
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
        if (this.readyState == 4) {
            hideLoader();
            if (this.status == 200) {
                obj = JSON.parse(this.responseText);
                if (obj.status !== 'ok') {
                    alert("REQUEST got status: "+obj.status);
                }
                alert(this.responseText);
                window.location.reload(true);
            } else {
                alert("REQUEST got code: " + this.status + ", check the log of ScrapydWeb");
                if(id !== undefined) {
                    my$('#'+id).innerHTML = getRequestFailHtml(url, 'code', this.status);
                } else {
                    window.location = url;
                }
            }
        }
    };
    req.open("get", url, Async = true);
    req.send();
}


function handleDropdown() {
    var x = my$('.dropdown-content-wrap');
    //console.log(x.style.display);
    if (x.style.display != 'flex') {
        my$('.dropdown').style.backgroundColor = '#9DC8C8';
        my$('.dropdown').style.border = '1px solid #9DC8C8';
        my$('.dropbtn').style.color = '#fff';
        my$('.icon.anchor').style.transform = 'rotate(90deg)';
        x.style.display = '';
        my$('.dropdown-content-wrap').style.display = 'flex';
    } else {
        my$('.dropdown').style.backgroundColor = '#fff';
        my$('.dropdown').style.border = '1px solid #03a87c';
        my$('.dropbtn').style.color = '#03a87c';
        my$('.icon.anchor').style.transform = 'rotate(0deg)';
        x.style.display = 'none';
    }
}


function forceLoader(url) {
    showLoader();
    setTimeout("window.location = '"+url+"'; hideLoader();", 1000);
}


function getRequestFailHtml(url, code_status, result) {
    return '<a target="_blank" class="request" href="'+url+'">'+'REQUEST</a><em class="fail"> got '+code_status+': '+result+'</em>';
}

