import React from 'react';
import QueryTableWidget from '../../components/QueryTableWidget'
import Configurator from '../../components/Configurator'
import { Spinner, Grid, GridItem } from 'nr1'
import CONFIG from '../../config.json'

export default class MultiAccountQueryNerdlet extends React.Component {

    constructor(props) {
        super(props);
        this.state = { config: null }
        
        //set in config.json
        this.accountId=CONFIG.accountId                     // the account ID to store the congig in
        this.storageCollection=CONFIG.storageCollectionName //the collection name to store the config in
        
        this.defaultPredefinedQueries={                     //just for when the tool first loads
            "queries": [
                {
                    "aggregatorField": "count",
                    "title": "Example Query",
                    "nrql": "SELECT count(*) as count FROM Transaction facet appName SINCE 1 DAY AGO LIMIT MAX"
                }
            ],
            "querySharding": 20
        }


        this.schema = {
            "type": "object",
            "properties": {
                "queries": {
                    "type": "array",
                    "title": "Queries",
                    "items": {
                        "type": "object",
                        "properties": {
                            "title": {
                                "type": "string",
                                "title": "Title",
                            },
                            "nrql": {
                                "type": "string",
                                "title": "NRQL Query",
                            },
                            "sortField": {
                                "type": "string",
                                "title": "Sort field"
                            }
                        }
                    }
                },
                "excludeAccounts": {
                    "type": "string",
                    "title": "Exclude accounts",
                    "description": "Comma seperated list of accounts to exclude from the query"
                },
                "querySharding": {
                    "type": "number",
                    "title": "Accounts per post",
                    "description": "How many accounts are queried per graphql post. Reduce this if you receive coplexity errors.",
                    "default": 20
                }
                
            }
        }
       
    }

    render() {
       
       const { config } = this.state

       let needsConfig=<div><Spinner inline /> Loading configuration...</div>
       if(config) {
        needsConfig=<QueryTableWidget config={config} />
       }

       return <Grid>
           <GridItem columnSpan={12}>
           
                {needsConfig}

                <div style={{marginTop:"5em"}}>
                <Configurator  
                        schema={this.schema}                                // schema for the config form data
                        dataChangeHandler={(data)=>{this.setState({config:data})}}        // callback function run when config changes
                        default={this.defaultPredefinedQueries}
                        accountId={this.accountId}                                 // the accountId to store config against
                        storageCollectionId={this.storageCollection}             // the nerdstorage collection name to store config
                        documentId="config"                                 // the nerstorage document id prefix

                        buttonTitle="Edit Predefined Queries"                         // Some customisation of the configurator UI
                        modalTitle="Predefined Queries"
                        modalHelp="Use the form below to configure the available queries in the drop down"

                    />
                    </div>
                </GridItem>
           </Grid>  
      }
}
