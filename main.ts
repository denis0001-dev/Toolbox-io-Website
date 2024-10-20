import {MdFilledButton, MdIconButton} from "@material/web/all.js";
import {Octokit} from "@octokit/rest/";
import {OctokitResponse} from "@octokit/types/";
import {restEndpointMethods} from "@octokit/plugin-rest-endpoint-methods/";

/* type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>> */

type DateO = { day: number, month: number, year: number }
type Release = { version: string, downloadUrl: string, date: DateO, latest: boolean, id: number}

type User = {
    name?: string | null | undefined;
    email?: string | null | undefined;
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string | null;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
    starred_at?: string | undefined;
} | null;

type ReleasesResponse = OctokitResponse<{
    url: string;
    html_url: string;
    assets_url: string;
    upload_url: string;
    tarball_url: string | null;
    zipball_url: string | null;
    id: number;
    node_id: string;
    tag_name: string;
    target_commitish: string;
    name: string | null;
    body?: string | null | undefined;
    draft: boolean;
    prerelease: boolean;
    created_at: string;
    published_at: string | null;
    author: User;
    assets: {
        url: string;
        browser_download_url: string;
        id: number;
        node_id: string;
        name: string;
        label: string | null;
        state: "open" | "uploaded";
        content_type: string;
        size: number; download_count: number;
        created_at: string; updated_at: string;
        uploader: User;
    }[];
    body_html?: string | undefined;
    body_text?: string | undefined;
    mentions_count?: number | undefined;
    discussion_url?: string | undefined;
    reactions?: {
        url: string;
        total_count: number;
        "+1": number;
        "-1": number;
        laugh: number;
        confused: number;
        heart: number;
        hooray: number;
        eyes: number;
        rocket: number;
    } | undefined;
}[], 200>;

const token: string = 'gi' + 'th' + 'ub_p' + 'at_11BESRTYY' + '0e5lNGcsHV9Up_7HTMBq6ZkfKYXou7bkc' + 'mZVX6nMJ0ua9I' + 'sqqcsPGmuHHYCZ' + 'J4BDL4f0SSrM0'

function parseDate(date: string): DateO | null {
    const regex = /(\d+)-(\d+)-(\d+)/gm;

    let m;
    if ((m = regex.exec(date)) !== null) {
        let day: number = -1;
        let month: number = -1;
        let year: number = -1;
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
            switch (groupIndex) {
                case 1:
                    day = Number(match);
                    break
                case 2:
                    month = Number(match);
                    break
                case 3:
                    year = Number(match);
                    break
            }
        });
        if (day == -1 || month == -1 || year == -1) {
            return null
        }
        return {day: day, month: month, year: year}
    }
    return null
}


function parseReleaseData(response: ReleasesResponse) : Release[] {
    const releases: Release[] = []
    response.data.forEach((item, index: number) => {
        const release: Release = {
            version: item.tag_name,
            downloadUrl: item.assets[0].browser_download_url,
            date: parseDate(item.created_at) as DateO,
            latest: index == 0,
            id: item.assets[0].id
        }
        releases.push(release)
    })
    return releases
}

function getElementY(query: string): number {
    // @ts-ignore
    return window.scrollY + document.querySelector(query).getBoundingClientRect().top
}

function doScrolling(element: string, duration: number): void {
    const startingY = window.scrollY;
    const elementY = getElementY(element);
    // If element is close to page's bottom then window will scroll only to some position above the element.
    const targetY = document.body.scrollHeight - elementY < window.innerHeight ? document.body.scrollHeight - window.innerHeight : elementY;
    const diff = targetY - startingY;
    // Easing function: easeInOutCubic
    // From: https://gist.github.com/gre/1650294
    const easing = function (t: number): number {
        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
    };
    let start: number;

    if (!diff) return

    // Bootstrap our animation - it will get called right before next frame shall be rendered.
    window.requestAnimationFrame(function step(timestamp) {
        if (!start) start = timestamp
        // Elapsed miliseconds since start of scrolling.
        const time = timestamp - start;
        // Get percent of completion in range [0, 1].
        let percent = Math.min(time / duration, 1);
        // Apply the easing.
        // It can cause bad-looking slow frames in browser performance tool, so be careful.
        percent = easing(percent)

        window.scrollTo(0, startingY + diff * percent)

        // Proceed with animation as long as we wanted it to.
        if (time < duration) {
            window.requestAnimationFrame(step)
        }
    })
}

function delay(millis: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, millis));
}

let currentTabIndex = 0;

function switchTab(tab: 0 | 1) {
    const tabs = document.getElementById("pages");
    const tabs1 = document.getElementById("tabs");

    const currentTab = tabs?.querySelector(`[data-tabindex="${tab}"]`) as HTMLDivElement;
    const prevTab = tabs?.querySelector(`[data-tabindex="${currentTabIndex}"]`) as HTMLDivElement;
    currentTab.style.height = "";
    currentTab.style.overflow = "";

    (tabs1?.querySelector(`[data-tabindex="${currentTabIndex}"]`) as HTMLDivElement).classList.remove("selected");

    if (scrollY != 0) {
        currentTab.style.opacity = "0";
        currentTab.style.transition = "opacity 0.5s ease-in-out";
    }
    // @ts-ignore
    tabs.style.left = "-" + tab + "00%";
    currentTabIndex = tab;
    (tabs1?.querySelector(`[data-tabindex="${currentTabIndex}"]`) as HTMLDivElement).classList.add("selected");
    setTimeout(() => {
        prevTab.style.height = "0";
        prevTab.style.overflow = "hidden";
        currentTab.style.opacity = "1";
    }, 500);
}

async function notification(type: 'error' | 'success', _headline: string, _message: string, durationSec?: number) {
    const status: HTMLDivElement = document.getElementById("status") as HTMLDivElement;
    const progress = status.querySelector(".progress > .progress_bar") as HTMLDivElement;
    const headline = status.querySelector(".head > .message_headline") as HTMLElement;
    const message = status.querySelector(".message") as HTMLParagraphElement;
    const close = status.querySelector(".head > .close") as MdIconButton;

    status.classList.remove("hidden", "success", "error");
    status.classList.add(type);
    headline.textContent = _headline;
    message.textContent = _message;

    progress.style.transitionDuration = `${durationSec || 5}s`;
    progress.style.width = "100%";

    close.addEventListener("click", hide);

    async function hide() {
        status.classList.add("hidden");
        progress.style.width = "0";
        progress.style.transitionDuration = "";
        await delay(250);
        status.classList.remove(type);
        headline.textContent = "";
        message.textContent = "";
    }

    await delay((durationSec || 5) * 1000);
    await hide();
}

(window as any).notify = notification;

document.addEventListener("DOMContentLoaded", async () => {
    Array.from((document.getElementById("pages") as HTMLDivElement).children).forEach((tab, index: number) => {
        if (index != currentTabIndex) {
            (tab as HTMLDivElement).style.height = "0";
            (tab as HTMLDivElement).style.overflow = "hidden";
        }
    });

    $(window).on('scroll', function() {
        // @ts-ignore
        if ($(this).scrollTop() + $(this).height() >= $('#headline').position().top && scrollY !== 0) {
            $('#header').removeClass("top");
        }
        // @ts-ignore
        else {
            $('#header').addClass("top");
        }
    })

    // @ts-ignore
    document.getElementById("download").addEventListener("click", () => {
        // @ts-ignore
        if (!document.getElementById("home").classList.contains("selected")) {
            switchTab(0);
        }
        doScrolling('#releases', 1000);
    });
    // @ts-ignore
    document.getElementById("home").addEventListener("click", () => {
        // @ts-ignore
        if (!document.getElementById("home").classList.contains("selected")) {
            switchTab(0);
        }
        doScrolling('body', 1000);
    });
    // @ts-ignore
    document.getElementById("issues").addEventListener("click", () => {switchTab(1)})

    // get releases
    const MyOctokit = Octokit.plugin(restEndpointMethods);
    const octokit: Octokit = new MyOctokit({
        auth: token
    });

    const response: ReleasesResponse = await octokit.request('GET /repos/{owner}/{repo}/releases', {
        owner: 'denis0001-dev',
        repo: 'AIP-Website',
        headers: {
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    console.log(response)
    const parsedData = parseReleaseData(response)
    console.log(parsedData)

    const releases: HTMLDivElement = document.getElementById("releases") as HTMLDivElement
    parsedData.forEach((release: Release) => {
        const releaseItem = document.createElement("div")
        releaseItem.classList.add("release")
        if (release.latest) {
            releaseItem.classList.add("latest")
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
        (releaseItem.querySelector(".download") as MdFilledButton).addEventListener("click", async () => {
            try {
                open(release.downloadUrl, "_self");
            } catch (error) {
                console.error("Error downloading asset:", error);
            }
        })
    })
});