import {MdFilledButton} from "@material/web/all.js";
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

const token: string = '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'

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
            downloadUrl: item.assets[0].url,
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

document.addEventListener("DOMContentLoaded", async () => {
    $(window).on('scroll', function() {
        // @ts-ignore
        if ($(this).scrollTop() + $(this).height() >= $('#headline').position().top && scrollY !== 0) {
            $('#header').removeClass("top");
        }
        // @ts-ignore
        else /* if ($('#line-before-related-article').position().top >= $(this).scrollTop()) */ {
            $('#header').addClass("top");
        }
    })

    // @ts-ignore
    document.getElementById("download").addEventListener("click", doScrolling.bind(null, '#releases', 1000))
    // @ts-ignore
    document.getElementById("home").addEventListener("click", doScrolling.bind(null, 'body', 1000))

    // get releases
    const MyOctokit = Octokit.plugin(restEndpointMethods);
    const octokit: Octokit = new MyOctokit({
        auth: token
    });

    const response: ReleasesResponse = await octokit.request('GET /repos/{owner}/{repo}/releases', {
        owner: 'denis0001-dev',
        repo: 'Anti-Intruder-Protection',
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
                /* console.log(await octokit.rest.repos.getReleaseAsset({
                    owner: 'denis0001-dev',
                    repo: 'Anti-Intruder-Protection',
                    asset_id: release.id,
                    headers: {
                        'Accepts': 'application/octet-stream'
                    }
                })); */
                console.log(await fetch(`https://cors-anywhere.herokuapp.com/${release.downloadUrl.replace(/https?:\/\/(.*)/, "$1")}`), {
                    method: "GET",
                    headers: {
                        accept: "application/octet-stream",
                        authorization: `Bearer ${token}`,
                        'X-GitHub-Api-Version': '2022-11-28',
                        'user-agent': navigator.userAgent,
                        origin: location.origin
                    }
                })
            } catch (error) {
                console.error("Error downloading asset:", error);
            }
        })
    })
})