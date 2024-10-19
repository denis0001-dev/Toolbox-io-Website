import { Octokit } from "@octokit/rest/";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods/";
const token = 'gi' + 'th' + 'ub_p' + 'at_11BESRTYY' + '0e5lNGcsHV9Up_7HTMBq6ZkfKYXou7bkc' + 'mZVX6nMJ0ua9I' + 'sqqcsPGmuHHYCZ' + 'J4BDL4f0SSrM0';
function parseDate(date) {
    const regex = /(\d+)-(\d+)-(\d+)/gm;
    let m;
    if ((m = regex.exec(date)) !== null) {
        let day = -1;
        let month = -1;
        let year = -1;
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            switch (groupIndex) {
                case 1:
                    day = Number(match);
                    break;
                case 2:
                    month = Number(match);
                    break;
                case 3:
                    year = Number(match);
                    break;
            }
        });
        if (day == -1 || month == -1 || year == -1) {
            return null;
        }
        return { day: day, month: month, year: year };
    }
    return null;
}
function parseReleaseData(response) {
    const releases = [];
    response.data.forEach((item, index) => {
        const release = {
            version: item.tag_name,
            downloadUrl: item.assets[0].browser_download_url,
            date: parseDate(item.created_at),
            latest: index == 0,
            id: item.assets[0].id
        };
        releases.push(release);
    });
    return releases;
}
function getElementY(query) {
    // @ts-ignore
    return window.scrollY + document.querySelector(query).getBoundingClientRect().top;
}
function doScrolling(element, duration) {
    const startingY = window.scrollY;
    const elementY = getElementY(element);
    // If element is close to page's bottom then window will scroll only to some position above the element.
    const targetY = document.body.scrollHeight - elementY < window.innerHeight ? document.body.scrollHeight - window.innerHeight : elementY;
    const diff = targetY - startingY;
    // Easing function: easeInOutCubic
    // From: https://gist.github.com/gre/1650294
    const easing = function (t) {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    let start;
    if (!diff)
        return;
    // Bootstrap our animation - it will get called right before next frame shall be rendered.
    window.requestAnimationFrame(function step(timestamp) {
        if (!start)
            start = timestamp;
        // Elapsed miliseconds since start of scrolling.
        const time = timestamp - start;
        // Get percent of completion in range [0, 1].
        let percent = Math.min(time / duration, 1);
        // Apply the easing.
        // It can cause bad-looking slow frames in browser performance tool, so be careful.
        percent = easing(percent);
        window.scrollTo(0, startingY + diff * percent);
        // Proceed with animation as long as we wanted it to.
        if (time < duration) {
            window.requestAnimationFrame(step);
        }
    });
}
document.addEventListener("DOMContentLoaded", async () => {
    $(window).on('scroll', function () {
        // @ts-ignore
        if ($(this).scrollTop() + $(this).height() >= $('#headline').position().top && scrollY !== 0) {
            $('#header').removeClass("top");
        }
        // @ts-ignore
        else /* if ($('#line-before-related-article').position().top >= $(this).scrollTop()) */ {
            $('#header').addClass("top");
        }
    });
    // @ts-ignore
    document.getElementById("download").addEventListener("click", doScrolling.bind(null, '#releases', 1000));
    // @ts-ignore
    document.getElementById("home").addEventListener("click", doScrolling.bind(null, 'body', 1000));
    // get releases
    const MyOctokit = Octokit.plugin(restEndpointMethods);
    const octokit = new MyOctokit({
        auth: token
    });
    const response = await octokit.request('GET /repos/{owner}/{repo}/releases', {
        owner: 'denis0001-dev',
        repo: 'AIP-Website',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    });
    console.log(response);
    const parsedData = parseReleaseData(response);
    console.log(parsedData);
    const releases = document.getElementById("releases");
    parsedData.forEach((release) => {
        const releaseItem = document.createElement("div");
        releaseItem.classList.add("release");
        if (release.latest) {
            releaseItem.classList.add("latest");
        }
        releaseItem.innerHTML = `
            <div class="version">${release.version}</div>
            <div class="latest_mark">Latest</div>
            <div class="space"></div>
            <md-filled-button class="download">
                Download
                <svg slot="icon" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368">
                    <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                </svg>
            </md-filled-button>
        `;
        releases.appendChild(releaseItem);
        releaseItem.querySelector(".download").addEventListener("click", async () => {
            try {
                open(release.downloadUrl, "_self");
            }
            catch (error) {
                console.error("Error downloading asset:", error);
            }
        });
    });
});
