//= require ../vendor/jquery/dist/jquery.js
//= require ../vendor/bootstrap-sass-official/assets/javascripts/bootstrap.js

$(function() {

    var whatWasDone = null;
    var affectedAreas = null;
    var mergeRequest = null;
    var deployedTo = null;
    var affectedAreasDefaultVal = 'this was the point fix, should not affect anything, related only to this issue.';

    initialize();

    $('#submit').on('click', function(e) {
        var commentSrc = [
                        "{panel:title=Developer's comment|borderColor=#828282|titleBGColor=#61BEE2|bgColor=#E4F7FD} ",
                        "- *What was done:* "+whatWasDone.val(),
                        "- *Affected areas:* "+affectedAreas.val(),
                        "- *MergeRequest:* "+mergeRequest.val(),
                        "- *Deployed to:* "+deployedTo.val(),
                        "{panel}"
                       ].join('\\n');

        var code = [
            "var footerCommentButton = document.getElementById('footer-comment-button');",
            "var comment = document.getElementById('comment');",
            "if (footerCommentButton && comment) {",
            "   footerCommentButton.click();",
            "   comment.value += \""+commentSrc.split('"').join('\\"')+"\";",
            "}"].join('\n');
    
        chrome.tabs.executeScript(null, {code: code});

        window.close();

    });

    function initialize() {
        whatWasDone = initializeVar('#what-was-done-input', 'what-was-done');
        affectedAreas = initializeVar('#affected-areas-input', 'affected-areas');
        mergeRequest = initializeVar('#merge-request-input', 'merge-request');
        deployedTo = initializeVar('#deployed-to-input', 'deployed-to');

        fill();
    }

    function initializeVar(id, name) {
        var el = $(id);

        el.write = function() {
            write(name, $(this).val());
        };
        el.read = function(defaults) {
            $(this).val(read(name, defaults));
        };
        el.update = function(val) {
            $(this).val(val);
            el.write();
        };
        el.on('change', function() {
            el.write();
        });
        return el;
    }

    function write(key, val) {
        localStorage[genKeyName(key)] = val;
    }

    function read(key, defaults) {
        var val = localStorage[genKeyName(key)];
        return val ? val : (defaults !== undefined ? defaults : '');
    }

    function genKeyName(n) {
        return '__jira_developer_comment_plugin_' + n;
    }

    function fill() {
        whatWasDone.read();
        affectedAreas.read(affectedAreasDefaultVal);
        mergeRequest.read();
        deployedTo.read();
    }

    function save() {
        whatWasDone.write();
        affectedAreas.write();
        mergeRequest.write();
        deployedTo.write();
    }
    function clear() {
        whatWasDone.update('');
        affectedAreas.update(affectedAreasDefaultVal);
        mergeRequest.update('');
        deployedTo.update('');
    }

    // Hack, because we couldn't receive unload event correct to save data. https://code.google.com/p/chromium/issues/detail?id=31262#c13
    setInterval(save, 100);
});