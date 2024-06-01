<!--
  @component
  ## Props
  @prop export let discord: string = '';
-->

<script lang="ts">
    export let discord: string = '';
</script>

<div class="flex flex-1 flex-col w-full max-w-screen-2xl px-4">
    <div class="flex flex-col mb-4">
        <h1 class="text-3xl text-center font-bold my-4 dark:text-neutral-100 text-neutral-900">
            <span class="italic text-neutral-500 opacity-50">#</span>
            RULES
        </h1>
        <ul class="list-inside list-decimal text-lg dark:text-neutral-100 text-neutral-900 marker:font-bold">
            <li class="mb-2">
                <b>No Platform Attacks:</b> Participants must not attempt to disrupt or attack the CTF platform infrastructure
                in any way. This includes but is not limited to DDoS attacks, injection attacks, or any other malicious activities
                targeting the platform's servers or network.
            </li>
            <li class="mb-2">
                <b>No Unauthorized Access:</b> Participants must not attempt to gain unauthorized access to any part of the
                CTF platform system, including backend servers, databases, or administrative interfaces. All access must
                be within the scope defined by the organizers.
            </li>
            <li class="mb-2">
                <b>Prohibition of Teaming:</b> Participants are prohibited from teaming up with individuals or groups outside
                of the designated team structure defined by the organizers. Collaboration should be limited to members of
                the same team during the competition.
            </li>
            <li class="mb-2">
                <b>Flag Sharing Prohibited:</b> Sharing specific flag solutions or answers with participants from other teams
                during an active competition is strictly prohibited. Each team must solve challenges independently without
                outside assistance.
            </li>
            <li class="mb-2">
                <b>Respect Platform Integrity:</b> Participants must respect the integrity of the CTF platform by refraining
                from attempting to manipulate or exploit vulnerabilities within the platform itself. Any bugs or vulnerabilities
                discovered should be reported to the organizers immediately.
            </li>
            <li class="mb-2">
                <b>Compliance with Platform Usage Policies:</b> Participants must adhere to all platform usage policies and
                guidelines established by the organizers. This includes rules regarding account usage, submission of flags,
                and any other platform-specific regulations.
            </li>
            <li class="mb-2">
                <b>No Script Kiddie Behavior:</b> Participants are expected to demonstrate a basic understanding of cybersecurity
                principles and techniques. Script kiddie behavior, such as blindly running automated tools without understanding
                their implications, is discouraged.
            </li>
            <li class="mb-2">
                <b>Responsible Disclosure:</b> If participants discover any security vulnerabilities or weaknesses within
                the CTF platform, they are encouraged to responsibly disclose these findings to the organizers rather than
                exploiting them for personal gain.
            </li>
            <li class="mb-2">
                <b>Platform Abuse Reporting:</b> Participants should report any instances of platform abuse, suspicious behavior,
                or rule violations to the organizers promptly. This helps maintain a fair and secure environment for all
                participants.
            </li>
            <li>
                <b>Penalties for Violations:</b> Violations of platform-specific rules may result in penalties such as point
                deductions, disqualification, or banning from future competitions, depending on the severity and frequency
                of the offense.
            </li>
        </ul>
    </div>
    <div class="flex flex-col my-4 text-center">
        <h1 class="text-3xl text-center font-bold mb-4 dark:text-neutral-100 text-neutral-900">
            <span class="italic text-neutral-500 opacity-50">#</span>
            SUPPORT AND CONTACT
        </h1>
        <p class="text-xl dark:text-neutral-100 text-neutral-900 mb-4">
            For support or assistance, please report all technical issues and concerns to the platform administrators.
            Additionally, general communication and inquiries can be addressed through our official Discord. Join our
            Discord server to engage with other players and receive updates on upcoming changes and announcements.
        </p>
        <ul class="list-inside text-xl dark:text-neutral-100 text-neutral-900">
            <li>
                <b>Discord:</b> <a href={discord} target="_blank" class="italic underline text-blue-500">Official Discord</a>
            </li>
        </ul>
    </div>
</div>
