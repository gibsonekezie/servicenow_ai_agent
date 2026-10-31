import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    acl_incident_fixer_agent: {
                        table: 'sn_aia_agent'
                        id: 'b8510ad56ab340d79eed90938361272c'
                    }
                    acl_incident_fixer_agent_acl: {
                        table: 'sys_security_acl'
                        id: 'f0f7bbaaec324945a48d4cd0c586a94c'
                    }
                    bom_json: {
                        table: 'sys_module'
                        id: '6b8164d984644c568cadf8ba40412164'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '49c73ace0f624a70aacbb5675b4555a2'
                    }
                    src_server_script_ts: {
                        table: 'sys_module'
                        id: 'd7562aa20dcc4daab8186f0ad64f1e82'
                    }
                }
                composite: [
                    {
                        table: 'sys_security_acl_role'
                        id: '1652bb91962a4594b7f8fb70b1fbadd1'
                        key: {
                            sys_security_acl: 'f0f7bbaaec324945a48d4cd0c586a94c'
                            sys_user_role: 'b05926fa0a0a0aa7000130023e0bde98'
                        }
                    },
                    {
                        table: 'sn_aia_agent_tool_m2m'
                        id: '18053bdf045d4ee38dde38e69124a07e'
                        key: {
                            agent: 'b8510ad56ab340d79eed90938361272c'
                            tool: '576cf8eaffd922101dbaffffffffff66'
                            name: 'AIA Web Search'
                        }
                    },
                    {
                        table: 'sn_aia_tool'
                        id: '29a2c691842641949b6eeac2e36f0783'
                        key: {
                            name: 'Lookup Incident'
                        }
                    },
                    {
                        table: 'sn_aia_agent_tool_m2m'
                        id: '32498c25cd67404998bab841e7d956f0'
                        key: {
                            agent: 'b8510ad56ab340d79eed90938361272c'
                            tool: '29a2c691842641949b6eeac2e36f0783'
                            name: 'Lookup Incident'
                        }
                    },
                    {
                        table: 'sn_aia_agent_config'
                        id: '6bee9922e7aa48deaee97ced7f7d6071'
                        key: {
                            agent: 'b8510ad56ab340d79eed90938361272c'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '732c7654fc274ab796c9bd0be10dcc33'
                        key: {
                            sys_security_acl: 'f0f7bbaaec324945a48d4cd0c586a94c'
                            sys_user_role: '282bf1fac6112285017366cb5f867469'
                        }
                    },
                    {
                        table: 'sn_aia_version'
                        id: 'd2cba668eb34404a8e97841b56492985'
                        key: {
                            target_id: 'b8510ad56ab340d79eed90938361272c'
                            version_name: 'V1'
                        }
                    },
                ]
            }
        }
    }
}
