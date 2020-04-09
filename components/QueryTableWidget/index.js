import React from 'react';
import {Spinner, AccountsQuery,TableChart,TextField,Button, Grid, GridItem,SelectItem, Select } from 'nr1'
import AccountsNRQL from '../AccountsNRQL'

export default class QueryTableWidget extends React.Component {

    constructor(props) {
        super(props);
        this.state = { formData: {}, selectedQuery: "customOption"};
        this.querySharding=this.props.config.querySharding ? this.props.config.querySharding : 50 //shard the queries into sets of n to avoid breaching limits

        //specify any account ID's to skip querying
        this.accountExcludeList = this.props.config.excludeAccounts ? this.props.config.excludeAccounts : ""
        this.formSubmit = this.formSubmit.bind(this);
    }

    formSubmit(e) {
        e.preventDefault()
        this.setState({nrql: this.state.formData.nrql, sortField: this.state.formData.sortField})
    }

    handleChange(field,value){
        let fdata=this.state.formData;
        fdata[field]=value
        this.setState({
            formData: fdata
        });
    }

    render() {


        const { formData } = this.state
        const { config } = this.props

        let selectOptions=[]
        if(config.queries) {
            selectOptions=config.queries.map((query,idx)=>{
                return <SelectItem key={idx} value={""+idx}>{query.title}</SelectItem>
            })
        }
        selectOptions.push(<SelectItem key="custom" value="customOption">Custom query</SelectItem>)
        let queryChooser=<Select value={this.state.selectedQuery} onChange={(evt, value) => {
            if(value != "customOption") {
                this.setState({formData: {nrql: config.queries[value].nrql ? config.queries[value].nrql : "", sortField: config.queries[value].sortField ? config.queries[value].sortField : ""}, selectedQuery: value})
            } else {
                this.setState({formData: {nrql: "", sortField: ""}, selectedQuery: value})
            }
        }}>{selectOptions}</Select>




        const tabulateData = (data,sortField)=>{
            let tabulatedData=[]
            Object.keys(data).forEach((account_ref)=>{
                
                let account=data[account_ref]
                if(account.data && account.data.length > 0) {
                    account.data.forEach((row,idx)=>{
                        let rowData={
                            accountId: account.id,
                            accountName:  account.name
                        }
                        if(account.facets && account.facets.length > 0 ){
                            if(account.facets.length==1) {
                                rowData[account.facets[0]]=row.facet //edge case , single facets are not in an array
                            } else {
                                for(let col=0; col < account.facets.length; col++) {
                                    rowData[account.facets[col]]=row.facet[col]
                                }
                            }
                        }
                        //auto detect columns
                        let startIndex= (row.facet || row.facets) ? 2 : 0
                        let fields=Object.keys(row)
                        for(let i=startIndex; i < fields.length; i++) {
                            if(row[fields[i]] && typeof row[fields[i]] == "object") {
                                let subFields=Object.keys(row[fields[i]])
                                subFields.forEach((subField)=>{
                                    rowData[`${fields[i]}_${subField}`]=row[fields[i]][subField]
                                })

                            } else {
                                //straight values
                                rowData[fields[i]]=row[fields[i]]
                            }
                        } 
                        

                        tabulatedData.push(rowData)
                    })
                }
                
            })
            if(sortField) {
                tabulatedData.sort(function(a, b){return b[sortField] - a[sortField] });
            }
            return tabulatedData
        }

        let form =  <form onSubmit={(e)=>{e.preventDefault()}}>
            <Grid>

            <GridItem columnSpan={1}>
                {queryChooser}
            </GridItem>
            <GridItem columnSpan={11}>
                    <TextField
                        label="Enter NRQL:"
                        value={formData.nrql }
                        onChange={(e)=>{this.handleChange('nrql',e.target.value)}}
                    />
                </GridItem>
            </Grid>
            <Grid>
             <GridItem columnStart={2} columnEnd={12}>
                    <TextField
                        label="Sort field"
                        value={formData.sortField }
                        onChange={(e)=>{this.handleChange('sortField',e.target.value)}}
                    />
                </GridItem>
            </Grid>
            <Grid>
                <GridItem columnStart={2} columnEnd={12}>
                <br />    
                <Button onClick={this.formSubmit} iconType={Button.ICON_TYPE.INTERFACE__OPERATIONS__SEARCH} type={Button.TYPE.PRIMARY}>Run query</Button>
                </GridItem>
            </Grid>
        </form>


        return <div>
              {form}
              <div className="tableArea">
              <AccountsQuery>
                  {({ loading, error, data }) => {

                      if (loading) {
                       return <Grid>
                           <GridItem columnStart={2} columnEnd={12}><Spinner inline /> Loading account list...</GridItem>
                        </Grid>
                      }
  
                      if (error) {
                          return <Grid> <GridItem columnStart={2} columnEnd={12}>Error loading accounts!</GridItem></Grid>
                      }
  

                      let accountList=[]
                      data.forEach((account,idx)=>{
                        //if(idx < 10) {                            
                        if(!this.accountExcludeList.split(",").includes(""+account.id)) {
                            accountList.push( {
                                id: account.id,
                                name: account.name
                            })
                        }
                        //}
                      })

         
  
                      return <div >
                              {(() => {
                                  if(this.state.nrql) { 
                                        return <AccountsNRQL accountList={accountList} nrql={this.state.nrql} shardSize={this.querySharding}>
                                        {
                                                ({ loading, error, data }) => {
                                                if (loading) return <Grid><GridItem columnStart={2} columnEnd={12}><Spinner inline /> Loading query for data for {accountList.length} accounts...</GridItem></Grid>
                                                    if (error) { console.log(error);return <Grid><GridItem columnSpan={12}>Error loading data, check the console.</GridItem></Grid>}
                                                    if (data) {

                                                        let tableData=tabulateData(data,this.state.sortField)

                                                        //determine the columns, we need to find the row with the most columns.
                                                        let columns=[]
                                                        tableData.forEach((row)=>{
                                                            let rowKeys=Object.keys(row)
                                                            if(rowKeys.length > columns.length) { columns=rowKeys }
                                                        })
                                                        
                                                                                                                
                                                        if(tableData && tableData.length > 0 ) {
                                                            const tdata = [
                                                                {
                                                                    metadata: {
                                                                        id: 'series-1',
                                                                        name: 'Series 1',
                                                                        color: '#008c99',
                                                                        viz: 'main',
                                                                        columns: columns.splice(0,50), //limit to 50 columns
                                                                    },
                                                                    data: tableData
                                                                },
                                                            ];
                                                            let fields=Object.keys(tableData[0]).map((key,idx)=>{return idx==0 ? `"${key}"` : `, "${key}"`})
                                                            return <Grid><GridItem columnSpan={12}>
                                                                 <div className="totalRows"><strong>Total rows:</strong> {tableData.length}</div>
                                                                 <div className="resultFields"><strong>Result fields:</strong> {fields}</div>
                                                                <TableChart data={tdata} fullWidth style={{"height": "80vw"}} />
                                                                
                                                            </GridItem></Grid>
                                                        } else {
                                                            return <Grid><GridItem columnStart={2} columnEnd={12}>No data! Check the query.</GridItem></Grid>
                                                        }
                                                    }
                                                }
                                            }
                                        </AccountsNRQL>
                                  } else {
                                    return <Grid><GridItem columnStart={2} columnEnd={12}>Enter a query above and click the "Run Query" button.</GridItem></Grid>
                                  }
                                })()

                          }

                          </div>
                    
                  }}
              </AccountsQuery>
  
              </div>
          </div>
        
      }
}
