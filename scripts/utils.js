async function displayErrorMessage(message, timed = true, time = 2500) {
    if (!($("#error-popup").length)) {
        let fakeJSX = `<div id="error-popup"><p>${message}</p></div>`;
        $("body").append(fakeJSX);
        let height = $(document).height();
        $("body").append(`<div id='block-screen-error' style="height:${height}px"></div>`);
        if (timed) {
            await sleep(time);
            $("#error-popup").remove();
            $("#block-screen-error").remove();
        }
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showLive() {
    $('#past-collections').addClass('hidden');
    $('#live-collections').removeClass('hidden');
    if ($("#live-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#live-button").addClass("active");
    $("#past-button").removeClass("active");
}

function showPast() {
    $('#live-collections').addClass('hidden');
    $('#past-collections').removeClass('hidden');
    if ($("#past-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#past-button").addClass("active");
    $("#live-button").removeClass("active");
}

function showCreate() {
    $('#past-collections').addClass('hidden');
    $('#live-collections').removeClass('hidden');
    if ($("#live-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#listing-select").addClass('hidden');
    $("#create-button").addClass("active");
    $("#modify-button").removeClass("active");
}

function showModify() {
    $('#live-collections').addClass('hidden');
    $('#past-collections').removeClass('hidden');
    if ($("#past-collections .partner-collection").length > 3) {
        $("#scroll-indicator").removeClass("hidden");
    }
    else {
        $("#scroll-indicator").addClass("hidden");
    }
    $("#listing-select").removeClass('hidden');
    $("#modify-button").addClass("active");
    $("#create-button").removeClass("active");
}

function toggleMenu() {
    const el = document.getElementById("mobile-nav-menu");
    el.classList.toggle('expanded');
    el.classList.toggle('collapsed');
    const el2 = document.getElementById("expand-container");
    el2.classList.toggle('border-bottom-black');
}

function clearPendingTxs() {
    localStorage.removeItem("ShrineMarketPendingTxs");
    pendingTransactions.clear();
    location.reload();
};

// ======= DISCORD UTILS ========

// Polygon
const identityMapperAddress = "0x88C6a2aDc73Aaf4A5E659d5f170480fcdc595532";

// Testnet
// const identityMapperAddress = "0xffccE647DA8a266A8779875b9c68cb51DC236C80";

const identityMapperAbi = () => {
    return `[{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"addressToDiscord","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"addressToTwitter","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"discordTag_","type":"string"}],"name":"setDiscordIdentity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"twitterTag_","type":"string"}],"name":"setTwitterIdentity","outputs":[],"stateMutability":"nonpayable","type":"function"}]`;
}

const providerID = new ethers.providers.Web3Provider(window.ethereum, "any");
const signerID = providerID.getSigner();

const identityMapper = new ethers.Contract(identityMapperAddress, identityMapperAbi(), signerID);

const promptForDiscord = async () => {
    if (!($("#discord-popup").length)) {
        let userAddress = await signer.getAddress();
        let currentDiscord = await identityMapper.addressToDiscord(userAddress);
        let discordString = currentDiscord ? currentDiscord : "None";
        let fakeJSX = `<div id="discord-popup">
                         <div id="content">
                          <p>Enter Discord User ID to associate with purchases.</p>
                          <p>Current: ${discordString}</p>
                          <br>
                          <input id="discord-name" type="text" spellcheck="false" value="" placeholder="user#1234">
                          <br>
                          <button class="button" onclick="setDiscord()"">SET DISCORD</button>
                         </div>
                        </div>`;
        $("body").append(fakeJSX);
        let height = $(document).height();
        $("body").append(`<div id='block-screen-discord' style="height:${height}px" onclick="$('#discord-popup').remove();$('#block-screen-discord').remove()"></div>`);
    }
}

const setDiscord = async () => {
    try {
        let name = $("#discord-name").val();
        console.log(name)
        if (name == "") {
            await displayErrorMessage(`Error: No User ID provided!`);

        }
        else if (!(name.includes("#"))) {
            await displayErrorMessage(`Error: Must include "#" and numbers in ID!`);
        }
        else {
            await identityMapper.setDiscordIdentity(name).then(async (tx_) => {
                await waitForTransaction(tx_);
                $("#set-discord-button").html(`Setting<span class="one">.</span><span class="two">.</span><span class="three">.</span>`)
                $('#discord-popup').remove();
                $('#block-screen-discord').remove();
            });
        }
    }
    catch (error) {
        if ((error.message).includes("User denied transaction signature")) {
            console.log("Transaction rejected.");
        }
        else if ((error.message).includes("User rejected the transaction")) {
            console.log("Transaction rejected.");
        }
        else {
            await displayErrorMessage("An error occurred. See console and window alert for details...")
            window.alert(JSON.stringify(error));
            console.log(error);
        }
    }
}

let discordSet = false;

const updateDiscord = async () => {
    if (!discordSet) {
        let userAddress = await getAddress();
        let currentDiscord = await identityMapper.addressToDiscord(userAddress);
        if (currentDiscord) {
            discordSet = true
            $("#set-discord-button").addClass("hidden");
            $("#discord").addClass("success");
            $("#discord").removeClass("failure");
            $("#discord-mobile").addClass("success");
            $("#discord-mobile").removeClass("failure");
            $("#discord-text").text(`${currentDiscord.substr(0, 9)}...`);
            $("#account").addClass(`connected`);
            $("#discord-text-mobile").text(`${currentDiscord.substr(0, 9)}...`);
        }
        else {
            $("#set-discord-button").removeClass("hidden");
            $("#discord").addClass("failure");
            $("#discord").removeClass("success");
            $("#discord-mobile").addClass("failure");
            $("#discord-mobile").removeClass("success");
        }
    }
    if ($("#approval").hasClass("hidden") && $("#set-discord").hasClass("hidden")) {
        $("#onboarding-alert").addClass("hidden");
    }
    else {
        $("#onboarding-alert").removeClass("hidden");
    }
}

let timeout = 100;

setInterval(async () => {
    await updateDiscord();
    timeout = 5000;
}, timeout)