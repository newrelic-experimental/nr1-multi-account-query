[![New Relic Experimental header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Experimental.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#category-new-relic-experimental)



# NR1 Multi Account Query Tool

This application allows you to write an NRQL query which is run on all your sub accounts and collated into a single result set table. You can also specify pre-defined queries to make common queries easy to use.



It incorporates a [custom component](components/AccountrNRQL/index.js) that automates the batching of queries to the NerdGraph API which can be used seperately in your own projects.



## Configuration

- Configure the [config.json](config.json) with your account ID

The application stores configuration using NerdStorage so you must specify your New Relic account ID in the [config.json](config.json). Everything else is managed within the application.



