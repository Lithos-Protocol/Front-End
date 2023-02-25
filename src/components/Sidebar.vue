<template>
    <aside :class="`${is_expanded ? 'is-expanded' : ''}`">
        <div class="logo">

        </div>

        <div class="menu-toggle-wrap">
            <button class="menu-toggle" @click="ToggleMenu">
                <span class="material-icons">
                    <ChevronsRightIcon />
                </span>
            </button>
        </div>

        <h3>Menu</h3>
        <div class="menu">
            <router-link to="/" class="button">
                <span class="material-icons">
                    <HomeIcon />
                </span>
                <span class="text">Home</span>
            </router-link>
            <router-link to="/dashboard" class="button">
                <span class="material-icons">
                    <MonitorIcon />
                </span>
                <span class="text">Dashboard</span>
            </router-link>
            <router-link to="/Team" class="button">
                <span class="material-icons">
                    <UsersIcon />
                </span>
                <span class="text">Team</span>
            </router-link>
            <router-link to="/github" class="button">
                <span class="material-icons">
                    <GithubIcon />
                </span>
                <span class="text">GitHub</span>
            </router-link>
            <router-link to="/twitter" class="button">
                <span class="material-icons">
                    <TwitterIcon />
                </span>
                <span class="text">Twitter</span>
            </router-link>
            <router-link to="/telegram" class="button">
                <span class="material-icons">
                    <LaTelegramPlane />
                </span>
                <span class="text">Telegram</span>
            </router-link>
            <router-link to="/youtube" class="button">
                <span class="material-icons">
                    <YoutubeIcon />
                </span>
                <span class="text">Videos</span>
            </router-link>

        </div>

        <div class="flex"></div>

        <div class="menu">

        </div>
    </aside>
</template>

<script setup>
import { ref } from 'vue'
import logoURL from '../../src/Lithos_MARK3.svg'
import { ChevronsRightIcon, GithubIcon, HomeIcon, MonitorIcon, TwitterIcon, UsersIcon, YoutubeIcon } from '@zhuowenli/vue-feather-icons';
import LaTelegramPlane from './LaTelegramPlane.vue';

const is_expanded = ref(localStorage.getItem("is_expanded") === "true")

const ToggleMenu = () => {
    is_expanded.value = !is_expanded.value
    localStorage.setItem("is_expanded", is_expanded.value)
}
</script>

<style lang="scss" scoped>
:root {
    --sidebar-width: 400px;
}

aside {
    display: flex;
    flex-direction: column;

    background-color: var(--dark);
    color: var(--light);

    width: calc(2rem + 32px);
    overflow: hidden;
  
    height: 100%;
    padding: 1rem;

    transition: 0.2s ease-in-out;

    .flex {
        flex: 1 1 0%;
    }

    .logo {
        margin-bottom: 1rem;

        img {
            width: 2rem;
        }
    }

    .menu-toggle-wrap {
        display: flex;
        margin-top: 2rem;
        margin-bottom: 1rem;

        position: relative;
        top: 0;
        transition: 0.2s ease-in-out;

        .menu-toggle {
            transition: 0.2s ease-in-out;

            .material-icons {
                font-size: 2rem;
                color: var(--light);
                transition: 0.2s ease-out;
            }



            &:hover {
                .material-icons {
                    color: var(--primary);
                    transform: translateX(0.5rem);
                }
            }
        }
    }

    h3,
    .button .text {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;
    }

    h3 {
        color: var(--grey);
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
    }

    .menu {
        margin: 0 -1rem;

        .button {
            display: flex;
            align-items: center;
            text-decoration: none;

            transition: 0.2s ease-in-out;
            padding: 0.5rem 1rem;

            .material-icons {
                font-size: 2rem;
                color: var(--light);
                transition: 0.2s ease-in-out;
            }

            .text {
                color: var(--light);
                transition: 0.2s ease-in-out;

            }

            &:hover {
                background-color: var(--dark-alt);

                .material-icons,
                .text {
                    color: var(--primary);
                }
            }

            &.router-link-exact-active {
                background-color: var(--dark-alt);
                border-right: 5px solid var(--primary);

                .material-icons,
                .text {
                    color: var(--primary);
                }
            }
        }
    }

    .footer {
        opacity: 0;
        transition: opacity 0.3s ease-in-out;

        p {
            font-size: 0.875rem;
            color: var(--grey);
        }
    }

    &.is-expanded {
        width: var(--sidebar-width);

        .menu-toggle-wrap {
            top: -3rem;

            .menu-toggle {
                transform: rotate(-180deg);
            }
        }

        h3,
        .button .text {
            opacity: 1;
        }

        .button {
            .material-icons {
                margin-right: 1rem;
            }
        }

        .footer {
            opacity: 0;
        }
    }

    @media (max-width: 1024px) {
        position: absolute;
        z-index: 99;
    }
}
</style>