import React from 'react';
import {NerdGraphQuery} from 'nr1';

export default class AccountsNRQL extends React.Component {


    /*props expected:

        accountList - an array of account Ids
        nrql - the query to run on each account
        shardSize - the number of accoutns to query per graphql post (default is 10)
    */

    constructor(props) {
        super(props);
        this.state = {loading: true, error: false, queryData: null};
    }

    async componentDidMount() {
        this.loadData()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.nrql!==this.props.nrql){
            this.setState({loading: true, error: false, queryData: null})
            this.loadData()

        }
    }
    async loadData() {

        const { accountList, nrql, shardSize } = this.props
        let resultData={}

        const shardedQuery= (accountList) => { //returns a promise!
            return new Promise(function(resolve, reject) {

                let accountQueries=""
                accountList.forEach((account)=>{
                    accountQueries+=`
                        account_${account.id}: account(id: ${account.id}) {
                            nrql: nrql(query: "${nrql}") {
                                results
                                metadata { facets }
                            }                            
                        }
                    `
                })

                let query = `
                    query {
                        actor {
                            ${accountQueries}
                        }
                    }
                `
                const x = NerdGraphQuery.query({ query: query, variables: {}, fetchPolicyType: NerdGraphQuery.FETCH_POLICY_TYPE.NO_CACHE });
                x.then(results => {
                    accountList.forEach((account)=>{
                        if(results.data.actor[`account_${account.id}`] && results.data.actor[`account_${account.id}`].nrql && results.data.actor[`account_${account.id}`].nrql.results) {
                            resultData[`account_${account.id}`]= {
                                id: account.id,
                                name: account.name,
                                data: results.data.actor[`account_${account.id}`].nrql.results,
                                facets: results.data.actor[`account_${account.id}`].nrql.metadata.facets
                            }
                        }
                    })
                    resolve()
                }).catch((error) => { console.error(error); reject(error) })
                });
        }

        //chunkArray()
        //convert an array into array of arrays of certain length
        const chunkArray = (arr, len) => {
            var chunks = [],
                i = 0,
                n = arr.length;
            while (i < n) {
              chunks.push(arr.slice(i, i += len));
            }
            return chunks;
          }


        let accountListChunks=chunkArray(accountList,shardSize ? shardSize : 50)

        for (let i = 0; i < accountListChunks.length; i++) {
            try {
                await shardedQuery(accountListChunks[i])
            } catch(e) {
                console.log(`Error with request ${i+1}`)
            }
            
        }
        this.setState({queryData: resultData, loading: false})
    
    }

    render() {
        const { queryData, loading, error } = this.state
        return <div>
            {this.props.children({
                data: queryData,
                loading: loading,
                error: error
            })}
        </div>
    }
}
