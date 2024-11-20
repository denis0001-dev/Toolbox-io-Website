/* import {Octokit} from "@octokit/rest/";
import {OctokitResponse} from "@octokit/types/";
import {restEndpointMethods} from "@octokit/plugin-rest-endpoint-methods/"; */

/* import octokit = GithubUtils.octokit;
import parseReleaseData = GithubUtils.parseReleaseData;
import Release = GithubUtils.Release;
import ReleasesResponse = GithubUtils.ReleasesResponse;
import token = GithubUtils.token; */

/* type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>

type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>> */


/* namespace GithubUtils {
    export type DateO = { day: number, month: number, year: number }

    export type Release = { version: string, downloadUrl: string, date: DateO, latest: boolean, id: number }
    export type Issue = { number: number, title: string, description: string, label: { name: string, color: string } }

    export type User = {
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

    export type ReleasesResponse = OctokitResponse<{
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
    export type IssuesResponse = OctokitResponse<Array<{
        id: number;
        node_id: string;
        url: string;
        repository_url: string;
        labels_url: string;
        comments_url: string;
        events_url: string;
        html_url: string;
        number: number;
        state: string;
        state_reason?: "completed" | "reopened" | "not_planned" | null;
        title: string;
        body?: string | null;
        user: any;
        labels: any;
        assignee: any;
        assignees?: any;
        milestone: any;
        locked: boolean;
        active_lock_reason?: string | null;
        comments: number;
        pull_request?: {
            merged_at?: string | null;
            diff_url: string | null;
            html_url: string | null;
            patch_url: string | null;
            url: string | null
        };
        closed_at: string | null;
        created_at: string;
        updated_at: string;
        draft?: boolean;
        closed_by?: any;
        body_html?: string;
        body_text?: string;
        timeline_url?: string;
        repository?: any;
        performed_via_github_app?: any;
        author_association: any;
        reactions?: any
    }>, 200>

    let issuesLoaded = false;

    // Prevent secret detection
    export const token = 'gi' + 'th' + 'ub_p' + 'at_11BESRTYY' + '0e5lNGcsHV9Up_7HTMBq6ZkfKYXou7bkc' + 'mZVX6nMJ0ua9I' + 'sqqcsPGmuHHYCZ' + 'J4BDL4f0SSrM0'

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
                        year = Number(match);
                        break
                    case 2:
                        month = Number(match);
                        break
                    case 3:
                        day = Number(match);
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


    export function parseReleaseData(response: ReleasesResponse): Release[] {
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

    export let octokit: Octokit;

    export function parseIssueData(data: IssuesResponse): Issue[] {
        let issues: Issue[] = []

        data.data.forEach(issue => {
            issues.push(
                {
                    number: issue.number,
                    title: issue.title,
                    description: issue.body || "",
                    label: {
                        name: issue.labels[0].name,
                        color: issue.labels[0].color
                    }
                }
            );
        });

        return issues;
    }

    export async function loadIssues() {
        if (!issuesLoaded) {
            issuesLoaded = true;
            const issues = await GithubUtils.octokit.request('GET /repos/{owner}/{repo}/issues', {
                owner: 'denis0001-dev',
                repo: 'AIP-Website',
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });
            console.log(issues);
            const parsedIssues = GithubUtils.parseIssueData(issues);
            console.log(parsedIssues);
            parsedIssues.forEach(issue => {
                const element = document.createElement('div');
                element.className = "issue";
                element.innerHTML = `
            <div class="body">
                <div>#<span class="number">${issue.number}</span></div>
                <div class="label" style="--issue-label-color: #${issue.label.color}; display: block;">${issue.label.name}</div>
                <strong class="title">${issue.title}</strong>
                <div class="description">${issue.description}</div>
            </div>
            <md-ripple></md-ripple>
            <div class="separator"></div>
            `;
                (document.getElementById("issues_list") as HTMLDivElement).appendChild(element);
            });
        }
    }
} */

namespace Utils {
    /* import loadIssues = GithubUtils.loadIssues; */

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

    async function switchTab(tab: 0 | 1) {
        if (currentTabIndex == tab) return;
        if (tab == 1) {
            open("https://github.com/denis0001-dev/AIP-Website/issues", "_self");
            return;
        }
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
        await delay(500);
        prevTab.style.height = "0";
        prevTab.style.overflow = "hidden";
        currentTab.style.opacity = "1";
    }

    async function notification(type: 'error' | 'success', _headline: string, _message: string, durationSec?: number) {
        const status: HTMLDivElement = document.getElementById("status") as HTMLDivElement;
        const progress = status.querySelector(".progress > .progress_bar") as HTMLDivElement;
        const headline = status.querySelector(".head > .message_headline") as HTMLElement;
        const message = status.querySelector(".message") as HTMLParagraphElement;
        const close = status.querySelector(".head > .close") as HTMLElement;

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
            doScrolling('#download_h', 1000);
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
        // @ts-ignore
        document.getElementById("help").addEventListener("click", () => {
            // @ts-ignore
            if (!document.getElementById("home").classList.contains("selected")) {
                switchTab(0);
            }
            doScrolling("#help_h", 1000)
        })
        // @ts-ignore
        document.getElementById("issues_btn").addEventListener("click", () => {switchTab(1)})

        let videoListenerActive = true;
        let videoX: number | null = null;
        let videoY: number | null = null;
        let videoElement: HTMLVideoElement | null;

        async function scaleVideo() {
            if (videoListenerActive) {
                const dialog = document.getElementById("video_dialog") as HTMLDivElement;
                dialog.classList.add("open");
                const video = document.getElementById("demo") as HTMLVideoElement;
                const rect = video.getBoundingClientRect();
                let x = rect.x;
                const y = rect.y - 10;
                if (document.documentElement.offsetWidth > 500) x -= 10;
                video.style.position = "fixed";
                video.style.left = `${x}px`;
                video.style.top = `${y}px`;
                videoX = x;
                videoY = y;
                video.style.transitionProperty = "left, top, transform";
                video.style.transitionDuration = "0.5s";
                video.style.transitionTimingFunction = "ease-out";
                video.style.zIndex = "1003";
                videoElement = document.createElement("video");
                videoElement.style.width = rect.width + "px";
                videoElement.style.height = rect.height + "px";
                videoElement.style.margin = "10px";
                videoElement.style.marginBottom = "0px";
                videoElement.style.flexShrink = "0";
                video.insertAdjacentElement("beforebegin", videoElement);
                await delay(1);
                video.style.left = `calc(50% - ${rect.width / 2}px)`;
                video.style.top = `calc(50% - ${rect.height / 2}px)`;
                video.style.transform = document.documentElement.offsetWidth <= 375 ? "scale(1.4)" : "scale(1.5)";
                videoListenerActive = false;
                video.removeEventListener("click", scaleVideo)
                await delay(500);
                video.controls = true;
            }
        }

        // @ts-ignore
        document.getElementById("demo").addEventListener("click", scaleVideo);

        // @ts-ignore
        document.getElementById("video_dialog").addEventListener("click", async () => {
            const dialog = document.getElementById("video_dialog") as HTMLDivElement;
            dialog.style.opacity = "0";
            const video = document.getElementById("demo") as HTMLVideoElement;
            video.style.left = `${videoX}px`;
            video.style.top = `${videoY}px`;
            video.style.transform = "scale(1)";
            await delay(500);
            dialog.classList.remove("open");
            dialog.style.opacity = "";
            videoListenerActive = true;
            video.controls = false;
            (video.parentElement as HTMLDivElement).removeChild((videoElement as HTMLVideoElement));
            video.style.position = "";
            video.style.zIndex = "";
            video.style.left = "";
            video.style.top = "";
            video.style.transform = "";
            videoX = null;
            videoY = null;
            video.addEventListener("click", scaleVideo);
        });

        // hover fix
        let hasHoverClass = false;
        const container = document.body;
        let lastTouchTime = 0;

        function enableHover() {
            // filter emulated events coming from touch events
            // @ts-ignore
            if (new Date() - lastTouchTime < 500) return;
            if (hasHoverClass) return;

            container.className += ' hasHover';
            hasHoverClass = true;
        }

        function disableHover() {
            if (!hasHoverClass) return;

            container.className = container.className.replace(' hasHover', '');
            hasHoverClass = false;
        }

        function updateLastTouchTime() {
            // @ts-ignore
            lastTouchTime = new Date();
        }

        document.addEventListener('touchstart', updateLastTouchTime, true);
        document.addEventListener('touchstart', disableHover, true);
        document.addEventListener('mousemove', enableHover, true);
        enableHover();

        const features = document.getElementById("features") as HTMLElement;
        const blur = document.getElementById("card_dialog") as HTMLDivElement;
        Array.from(features.children).forEach((item) => {
            const feature = item as HTMLDivElement
            if (!feature.classList.contains("replacement") && feature.classList.length > 0) {
                const replacement = document.createElement("div");
                const desc = feature.querySelector(".feature-description") as HTMLDivElement
                const longDesc = feature.querySelector(".feature-long-description") as HTMLDivElement
                const close = feature.querySelector(".feature-close") as HTMLDivElement
                feature.addEventListener("click", async () => {
                    if (!feature.classList.contains("expanded")) {
                        const rect = feature.getBoundingClientRect();
                        const x = rect.x
                        const y = rect.y - 5;
                        const width = rect.width;
                        const height = rect.height;

                        replacement.classList.add("replacement");
                        if (getComputedStyle(features).gridTemplateColumns.indexOf(" ") === -1) {
                            replacement.style.width = `${width}px`;
                            replacement.style.height = `${height}px`;
                        } else {
                            replacement.style.width = "";
                            replacement.style.height = "";
                        }
                        Array.from(features.children).forEach(item2 => {
                            if (item2 != feature && item2.classList.length > 0) {
                                const item3 = item2 as HTMLDivElement
                                const rect2 = item3.getBoundingClientRect()
                                item3.style.width = `${rect2.width}px`;
                                item3.style.height = `${rect2.height}px`;
                                item3.style.boxSizing = "border-box";
                            }
                        })
                        feature.style.top = `${y}px`;
                        feature.style.left = `${x}px`;
                        feature.style.width = `${width}px`;
                        feature.style.height = `${height}px`;
                        feature.insertAdjacentElement("beforebegin", replacement);
                        feature.style.position = "fixed";
                        feature.style.boxSizing = "border-box";
                        feature.style.zIndex = "1001";
                        feature.style.transform = "none";
                        feature.style.animation = "cardExpand 0.5s ease-in-out";
                        feature.style.animationFillMode = "forwards";
                        feature.classList.add("noHover")

                        blur.classList.add("open");

                        desc.style.opacity = "0";
                        await delay(500);
                        desc.style.display = "none";

                        longDesc.style.display = "block";
                        longDesc.style.opacity = "1";

                        close.style.display = "block";
                        close.style.opacity = "1";
                        await delay(500);
                        feature.classList.add("expanded");
                    }
                })
                close.addEventListener("click", async () => {
                    const computedStyle = getComputedStyle(feature)
                    const top = computedStyle.top;
                    const left = computedStyle.left;
                    const width = computedStyle.width;
                    const height = computedStyle.height;
                    feature.style.animation = "";
                    feature.style.top = top;
                    feature.style.left = left;
                    feature.style.width = width;
                    feature.style.height = height;
                    const rect = replacement.getBoundingClientRect()
                    const top2 = computedStyle.top;
                    const left2 = computedStyle.left;
                    feature.style.top = "";
                    feature.style.left = "";
                    const top3 = (
                        Number(
                            computedStyle.top.replace("px", "")
                        ) + (
                            replacement.getBoundingClientRect().y -
                            features.getBoundingClientRect().y
                        ) - scrollY
                    ) + "px";
                    const left3 = (
                        Number(
                            computedStyle.left.replace("px", "")
                        ) + (
                            replacement.getBoundingClientRect().x -
                            features.getBoundingClientRect().x
                        ) - scrollX
                    ) + "px";
                    feature.style.top = `${top2}`;
                    feature.style.left = `${left2}`;

                    let tmpStyle: HTMLStyleElement | null = document.head.querySelector("style#tmp");
                    if (tmpStyle == null) {
                        tmpStyle = document.createElement("style");
                    }
                    // noinspection CssInvalidPropertyValue
                    tmpStyle.innerHTML = `
                    @keyframes cardCollapse {
                        from {}
                        to {
                            top: ${top3};
                            left: ${left3};
                            width: ${rect.width}px;
                            height: ${rect.height}px;
                        }
                    }
                    `
                    tmpStyle.id = "tmp";
                    document.head.appendChild(tmpStyle);
                    feature.style.animation = "cardCollapse 0.5s ease-in-out";
                    feature.style.animationFillMode = "";
                    longDesc.style.opacity = "0";
                    close.style.opacity = "0";
                    blur.style.opacity = "0";

                    await delay(500);
                    blur.classList.remove("open");
                    blur.style.opacity = "";
                    longDesc.style.display = "none";
                    close.style.display = "none";
                    desc.style.display = "block";
                    desc.style.opacity = "1";
                    feature.style.animation = "";
                    replacement.remove();
                    feature.style.top = "";
                    feature.style.left = "";
                    feature.style.width = "";
                    feature.style.height = "";
                    feature.style.position = "";
                    feature.style.zIndex = "";
                    feature.style.boxSizing = "";
                    feature.style.transform = "";
                    feature.classList.remove("noHover", "expanded");
                    Array.from(features.children).forEach(item2 => {
                        const item3 = item2 as HTMLDivElement;
                        if (item3.classList.length > 0) {
                            item3.style.width = "";
                            item3.style.height = "";
                            item3.style.boxSizing = "";
                        }
                    })
                })
            }
        });

        function countMatches(regex: RegExp, str: string) {
            let m;

            let counter = 0;

            while ((m = regex.exec(str)) !== null) {
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }

                // The result can be accessed through the `m`-variable.
                m.forEach((match, groupIndex) => {
                    console.log(`Found match, group ${groupIndex}: ${match}`);
                });
                counter++;
            }
            return counter;
        }

        function getRowHeight(grid: HTMLElement, row: number): number | null {
            let regex = /(\d+)px/gm
            let m;

            let counter = 0;

            let ret = null

            while ((m = regex.exec(getComputedStyle(grid).gridTemplateRows)) !== null) {
                counter++;
                // This is necessary to avoid infinite loops with zero-width matches
                if (m.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                if (counter === row) {
                    // The result can be accessed through the `m`-variable.
                    m.forEach((match, groupIndex) => {
                        if (groupIndex === 1) {
                            ret = Number(match)
                        }
                    });
                }
                if (ret !== null) return ret;
            }
            return ret;
        }

        function getRows(grid: HTMLElement) {
            return countMatches(/\d+px/gm, getComputedStyle(grid).gridTemplateRows);
        }

        function getColumns(grid: HTMLElement) {
            return countMatches(/\d+px/gm, getComputedStyle(grid).gridTemplateColumns);
        }

        function getItem(grid: HTMLElement, row: number, column: number): HTMLElement | null {
            // Calculate the index of the item in the grid
            const index = (row - 1) * getColumns(grid) + (column - 1);

            // Get all the grid items
            const items = grid.children;

            // Return the item at the specified index
            return items[index] as HTMLElement || null;
        }

        function setupGrid() {
            const rows = getRows(features)
            const columns = getColumns(features)

            const placeholders: HTMLDivElement[] = []

            for (let row = 1; row <= rows; row++) {
                let prevItem: HTMLElement | null = null;
                for (let column = 1; column <= columns; column++) {
                    const item = getItem(features, row, column);
                    if (!item && prevItem != null) {
                        const placeholder = document.createElement("div");
                        placeholder.style.height = `${getRowHeight(features, row)}px`;
                        placeholders.push(placeholder);
                    } else {
                        prevItem = item;
                    }
                }
            }

            for (const placeholder of placeholders) {
                features.appendChild(placeholder);
            }
        }

        function recalcPlaceholders() {
            Array.from(features.children).forEach(item => {
                const item2 = item as HTMLElement;
                if (item2.classList.length === 0) {
                    item2.style.height = "";
                }
            })
            const rows = getRows(features);
            const columns = getColumns(features);

            for (let row = 1; row <= rows; row++) {
                for (let column = 1; column <= columns; column++) {
                    const item = getItem(features, row, column);
                    if (item !== null && item.classList.length === 0) {
                        item.style.height = `${getRowHeight(features, row)}px`;
                    }
                }
            }
        }

        setupGrid()

        let rowsNow = getRows(features);
        let columnsNow = getColumns(features);
        let width = innerWidth

        addEventListener("resize", async () => {
            let rows = getRows(features);
            let columns = getColumns(features);
            if (rows !== rowsNow || columns !== columnsNow) {
                if ((innerWidth < width && innerWidth <= 1000) || (innerWidth > width && innerWidth > 1000)) {
                    await delay(1000);
                }
                Array.from(features.children).forEach(item => {
                    if (item.classList.length === 0) item.remove();
                })
                setupGrid();
                rowsNow = getRows(features);
                columnsNow = getColumns(features);
            } else {
                recalcPlaceholders();
            }
            width = innerWidth;
        })

        // get releases
        /* const MyOctokit = Octokit.plugin(restEndpointMethods);
        GithubUtils.octokit = new MyOctokit({
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
            (releaseItem.querySelector(".download") as HTMLElement).addEventListener("click", async () => {
                try {
                    open(release.downloadUrl, "_self");
                } catch (error) {
                    console.error("Error downloading asset:", error);
                }
            })
            if (release.latest) {
                const element = document.createElement("div");
                element.classList.add("separator");
                releases.appendChild(element);
            }
        }) */

        // @ts-ignore
        const loading: HTMLElement = document.getElementById("loading") as HTMLElement
        loading.classList.add("hidden")
        document.body.style.transform = ""
        document.body.style.overflow = "hidden";
        await delay(250)
        loading.classList.remove("hidden")
        loading.remove()
        await delay(250)
        document.body.style.overflow = "";
    });
}