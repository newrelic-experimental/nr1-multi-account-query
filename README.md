[![New Relic Experimental header](https://github.com/newrelic/opensource-website/raw/master/src/images/categories/Experimental.png)](https://opensource.newrelic.com/oss-category/#new-relic-experimental)

# New Relic One Multi-Account Query Tool (nr1-multi-account-query)

![CI](https://github.com/newrelic-experimental/nr1-multi-account-query/workflows/CI/badge.svg) ![GitHub release (latest SemVer including pre-releases)](https://img.shields.io/github/v/release/newrelic-experimental/nr1-multi-account-query?include_prereleases&sort=semver) [![Snyk](https://snyk.io/test/github/newrelic-experimental/nr1-multi-account-query/badge.svg)](https://snyk.io/test/github/newrelic-experimental/nr1-multi-account-query)

This application allows you to write an NRQL query which is run on all your sub accounts and collated into a single result set table. You can also specify pre-defined queries to make common queries easy to use.

It incorporates a [custom component](components/AccountrNRQL/index.js) that automates the batching of queries to the NerdGraph API which can be used seperately in your own projects.

![screenshot](gfx/screenshot.png)



![screenshot2](gfx/screenshot2.png)



## Configuration

- Configure the [config.json](config.json) with your account ID

The application stores configuration using NerdStorage so you must specify your New Relic account ID in the [config.json](config.json). Everything else is managed within the application.


## Date/Time formatting
Some fields return unix timestamps. To format these into more readable values specify the format you require in the 'as' label. To do this suffix you label with `|DATE:your-date-format-here`.

e.g:
```
select earliest(timestamp) as 'earliest|DATE:YYYY-MM-DD hh:mm', latest(timestamp) as 'latest|DATE:Do MMMM YYYY h:mm a' from Transaction 
```
Date formating strings should be specified as per the [momentjs documentation](https://momentjs.com/docs/#/displaying/format/)




**A note about vulnerabilities**

As noted in our [security policy](../../security/policy), New Relic is committed to the privacy and security of our customers and their data. We believe that providing coordinated disclosure by security researchers and engaging with the security community are important means to achieve our security goals.

If you believe you have found a security vulnerability in this project or any of New Relic's products or websites, we welcome and greatly appreciate you reporting it to New Relic through [HackerOne](https://hackerone.com/newrelic).

