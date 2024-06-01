/// <reference types="astro/client" />
declare namespace App {
	interface Locals {
		user: import("lucia").User;
		session: import("lucia").Session;
	}
}
