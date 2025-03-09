'use strict';
'require view';
'require ui';
'require form';
'require rpc';
'require uci';
'require fs';
'require tools.widgets as widgets';
'require tools.github as github';
'require tools.firewall as fwtool';

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: ['name'],
	expect: { '': {} }
});	

function getServiceStatus() {
	return L.resolveDefault(callServiceList('wifidogx'), {}).then(function (res) {
		var isRunning = false;
		try {
			isRunning = res['wifidogx']['instances']['instance1']['running'];
		} catch (e) { }
		return isRunning;
	});
}

function renderStatus(isRunning) {
	var renderHTML = "";
	var spanTemp = '<em><span style="color:%s"><strong>%s %s</strong></span></em>';

	if (isRunning) {
		renderHTML += String.format(spanTemp, 'green', _("apfree-wifidog"), _("running..."));
	} else {
		renderHTML += String.format(spanTemp, 'red', _("apfree-wifidog"), _("not running..."));
	}

	return renderHTML;
}

return view.extend({
	render: function() {
		var m, s, o, ss;

		m = new form.Map('wifidogx', _('ApFree-WiFiDog'));
		m.description = github.desc('apfree-wifidog offers a stable and secure captive portal solution.', 'liudf0716', 'apfree-wifidog');
		

		s = m.section(form.NamedSection, 'common',  _('Configuration'));
		s.addremove = false;
		s.anonymous = true;
		
		s.tab('basic', _('Basic Settings'));
		s.tab('gateway', _('Gateway Settings'));
		s.tab('advanced', _('Advanced Settings'));
		s.tab('rule', _('Rule Settings'));
		s.tab('qos', _('QoS Settings'));

		// basic settings
		o = s.taboption('basic', form.Flag, 'enabled', _('Enable'), _('Enable apfree-wifidog service.'));
		o.rmempty = false;

		o = s.taboption('basic', form.ListValue, 'auth_server_mode', _('Auth Server Mode'),
						_('The mode of the authentication server.'));
		o.value('cloud', _('Cloud Auth'));
		o.value('local', _('Local Auth'));
		o.value('bypass', _('Bypass Auth'));
		o.default = 'cloud';
		o.optional = false;

		o = s.taboption('basic', widgets.NetworkSelect, 'external_interface', _('External Interface'),
						_('The external interface of the device, if bypass mode, do not choose.'));
		o.rmempty = true;
		o.nocreate = true;
		o.loopback = false;
		o.default = 'wan';

		o = s.taboption('basic', form.Value, 'device_id', _('Device ID'), _('The ID of the device.'));
		o.rmempty = false;
		o.datatype = 'string';
		o.optional = false;
		o.depends('auth_server_mode', 'cloud');
		o.depends('auth_server_mode', 'bypass');

		o = s.taboption('basic', form.Value, 'auth_server_hostname', _('Auth Server Hostname'), 
						_('The domain or IP address of the authentication server.'));
		o.rmempty = false;
		o.datatype = 'or(host,ip4addr)';
		o.optional = false;
		o.depends('auth_server_mode', 'cloud');
		o.depends('auth_server_mode', 'bypass');

		o = s.taboption('basic', form.Value, 'auth_server_port', _('Auth Server Port'),
						_('The port of the authentication server.'));
		o.rmempty = false;
		o.datatype = 'port';
		o.optional = false;
		o.depends('auth_server_mode', 'cloud');
		o.depends('auth_server_mode', 'bypass');

		o = s.taboption('basic', form.Value, 'auth_server_path', _('Auth Server URI path'),
						_('The URI path of the authentication server.'));
		o.rmempty = false;
		o.datatype = 'string';
		o.optional = false;
		o.depends('auth_server_mode', 'cloud');
		o.depends('auth_server_mode', 'bypass');

		o = s.taboption('basic', form.Value, 'local_portal', _('Local Portal'),
						_('The local portal url.'));
		o.rmempty = false;
		o.datatype = 'string';
		o.optional = true;
		o.placeholder = 'http://www.example.com';
		o.depends('auth_server_mode', 'local');

		o = s.taboption('basic', form.ListValue, 'log_level', _('Log Level'),
						_('The log level of the apfree-wifidog.'));
		o.value(7, _('Debug'));
		o.value(6, _('Info'));
		o.value(5, _('Notice'));
		o.value(4, _('Warning'));
		o.value(3, _('Error'));
		o.value(2, _('Critical'));
		o.value(1, _('Alert'));
		o.value(0, _('Emergency'));
		o.defaulValue = 0;
		o.optional = false;

		// gateway settings
		o = s.taboption('gateway', form.SectionValue, '_gateway', form.GridSection, 'gateway');
		ss = o.subsection;
		ss.addremove = true;
		ss.nodescriptions = true;
		
		o = ss.option(widgets.DeviceSelect, 'gateway_name', _('Gateway Name'));
		o.filter = function(section_id, name) {
			var dev = this.devices.filter(function(dev) { return dev.getName() == name })[0];
			return (dev && dev.getType() == 'bridge');
		};
		o.rmempty = false;
		o.nocreate = true;
		o.allowany = true;
		o.default = 'lan';

		o = ss.option(form.Value, 'gateway_channel', _('Gateway Channel'),
						_('The channel of the gateway.'));
		o.datatype = 'string';
		o.rmempty = false;
		o.optional = false;

		o = ss.option(form.Value, 'gateway_id', _('Gateway ID'),
						_('The ID of the gateway.'));
		o.datatype = 'string';
		o.rmempty = false;
		o.optional = true;
		
		o = ss.option(form.Value, 'gateway_subnetv4', _('Gateway Subnetv4'),
						_('The ipv4 subnet of the gateway.'));
		o.datatype = 'cidr4';
		o.rmempty = false;
		o.optional = false;
		o.placeholder = '192.168.80.0/24';

		// advanced settings
		o = s.taboption('advanced', form.ListValue, 'long_conn_mode', _('Persistent Connection Mode'),
						_('The persistent connection mode of the device to auth server.'));
		o.value('ws', _('WebSocket Connection Mode'));
		o.value('wss', _('WebSocket Secure Connection Mode'));
		o.value('mqtt', _('MQTT Connection Mode'));
		o.value('none', _('None'));
		o.rmempty = false;
		o.defaulValue = 'ws';
		o.optional = false;

		o = s.taboption('advanced', form.Value, 'ws_server_hostname', _('WebSocket Hostname'),
						_('The hostname of the websocket, if the field is left empty, automatically use the same hostname as the auth server.'));
		o.datatype = 'or(host,ip4addr)';
		o.rmempty = true;
		o.optional = true;
		o.depends('long_conn_mode', 'ws');
		o.depends('long_conn_mode', 'wss');

		o = s.taboption('advanced', form.Value, 'ws_server_port', _('WebSocket Port'),
						_('The port of the websocket, if the field is left empty, automatically use the same port as the auth server.'));
		o.datatype = 'port';
		o.rmempty = true;
		o.optional = true;
		o.depends('long_conn_mode', 'ws');
		o.depends('long_conn_mode', 'wss');
		
		o = s.taboption('advanced', form.Value, 'ws_server_path', _('WebSocket URI path'),
						_('The URI path of the websocket.'));
		o.datatype = 'string';
		o.rmempty = true;
		o.optional = true;
		o.depends('long_conn_mode', 'ws');
		o.depends('long_conn_mode', 'wss');

		o = s.taboption('advanced', form.Value, 'mqtt_server_hostname', _('MQTT Hostname'),
						_('The hostname of the mqtt.'));
		o.datatype = 'or(host,ip4addr)';
		o.rmempty = true;
		o.optional = true;
		o.depends('long_conn_mode', 'mqtt');

		o = s.taboption('advanced', form.Value, 'mqtt_server_port', _('MQTT Port'),
						_('The port of the mqtt.'));
		o.datatype = 'port';
		o.rmempty = false;
		o.optional = false;
		o.depends('long_conn_mode', 'mqtt');
		o.defaulValue = 1883;

		o = s.taboption('advanced', form.Value, 'mqtt_username', _('MQTT Username'),
						_('The username of the mqtt.'));
		o.datatype = 'string';
		o.rmempty = true;
		o.optional = true;
		o.depends('long_conn_mode', 'mqtt');

		o = s.taboption('advanced', form.Value, 'mqtt_password', _('MQTT Password'),
						_('The password of the mqtt.'));
		o.datatype = 'string';
		o.rmempty = true;
		o.optional = true;
		o.depends('long_conn_mode', 'mqtt');

		o = s.taboption('advanced', form.Flag, 'enable_dns_forward', _('Enable Wildcard Domain'),
						_('Enable wildcard domain support.'));
		o.rmempty = false;
		o.defaulValue = true;

		o = s.taboption('advanced', form.Value, 'check_interval', _('Check Interval'),
						_('The interval of the check(s).'));
		o.datatype = 'uinteger';
		o.rmempty = false;
		o.optional = false;
		o.defaulValue = 60;

		o = s.taboption('advanced', form.Value, 'client_timeout', _('Client Timeout'),
						_('The timeout of the client.'));
		o.datatype = 'uinteger';
		o.rmempty = false;
		o.optional = false;
		o.defaulValue = 5;

		o = s.taboption('advanced', form.Flag, 'wired_passed', _('Wired Passed'),
						_('Wired users do not need to authenticate to access the internet.'));
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'apple_cna', _('Apple CNA'),
						_('Enable Apple Captive Network Assistant.'));
		o.rmempty = false;
		o.defaulValue = false;

		o = s.taboption('advanced', form.Flag, 'js_filter', _('JS Filter'),
						_('Enable JS redirect.'));
		o.rmempty = false;
		o.defaulValue = true;

		o = s.taboption('advanced', form.Flag, 'enable_anti_nat', _('Enable Anti NAT'),
						_('Enable Anti NAT devices.'));
		o.rmempty = false;
		o.defaulValue = false;

		o = s.taboption('advanced', form.Value, 'ttl_value', _('TTL Value'),
						_('The TTL value of the gateway support.'));
		o.datatype = 'string';
		o.rmempty = false;
		o.defaulValue = '64,128';
		o.depends('enable_anti_nat', '1');

		o = s.taboption('advanced', form.Value, 'anti_nat_permit_macs', _('Anti NAT Permit MAC'),
						_('The MAC address of the Anti NAT permit.'));
		o.datatype = 'macaddr';
		o.rmempty = true;
		o.depends('enable_anti_nat', '1');

		// QoS settings
		o = s.taboption('qos', form.Flag, 'enable_qos', _('Enable Global QoS'),
						_('Enable Global QoS.'));
		o.rmempty = false;
		o.defaulValue = false;

		o = s.taboption('qos', form.Value, 'qos_up', _('Global QoS Up'),
						_('The global QoS up value(Mbps).'));
		o.datatype = 'uinteger';
		o.rmempty = true;
		o.optional = true;
		o.defaulValue = 0;
		o.depends('enable_qos', '1');

		o = s.taboption('qos', form.Value, 'qos_down', _('Global QoS Down'),
						_('The global QoS down value(Mbps).'));
		o.datatype = 'uinteger';
		o.rmempty = true;
		o.optional = true;
		o.defaulValue = 0;
		o.depends('enable_qos', '1');

		// rule settings
		o = s.taboption('rule', form.DynamicList, 'trusted_wildcard_domains', _('Trusted Wildcard Domains'),
						_('The trusted wildcard domains of the gateway'));
		o.rmempty = true;
		o.optional = true;
		o.datatype = 'wildcard';
		o.placeholder = '.example.com';
		
		o = s.taboption('rule', form.DynamicList, 'trusted_domains', _('Trusted Domains'),
						_('The trusted domains of the gateway'));
		o.rmempty = true;
		o.optional = true;
		o.datatype = 'hostname';
		o.placeholder = 'www.example.com';

		o = s.taboption('rule', form.DynamicList, 'trusted_macs', _('Trusted MACs'),
						_('The trusted wildcard domains of the gateway.'));
		o.rmempty = true;
		o.optional = true;
		o.datatype = 'macaddr';
		o.placeholder = 'A0:B1:C2:D3:44:55';
		
		o = s.taboption('rule', widgets.WifidogxGroupSelect, 'app_white_list', _('App White List'),
						_('The app white list of the gateway.'));
		o.rmempty = true;
		o.multiple = true;
		o.nocreate = true;
		
		o = s.taboption('rule', widgets.WifidogxGroupSelect, 'mac_white_list', _('MAC White List'),
						_('The MAC white list of the gateway.'));
		o.rmempty = true;
		o.multiple = true;
		o.nocreate = true;
		o.setGroupType('mac');

		o = s.taboption('rule', widgets.WifidogxGroupSelect, 'wildcard_white_list', _('Wildcard White List'),
						_('The wildcard domain white list of the gateway.'));
		o.rmempty = true;
		o.multiple = true;
		o.nocreate = true;
		o.setGroupType('wildcard');
		
		s = m.section(form.GridSection, 'group',  _('Group Define'));
		s.addremove = true;
		s.anonymous = false;
		s.nodescriptions = true;

		s.handleRemove = function(section_id, ev) {
			// according section_id to check whether it is used by app_white_list or mac_white_list
			var group = uci.get('wifidogx', section_id, 'g_type') === '1' ? 'app_white_list' : 'mac_white_list';
			var groupList = uci.get('wifidogx', 'common', group);
			if (groupList) {
				for (var i = 0; i < groupList.length; i++) {
					if (groupList[i] === section_id) {
						ui.addNotification(null, E('p', [
							_('The group is used by '), E('strong', group), _(' please remove it from '), E('strong', group), _(' first.')
						]), 'warning');
						return false;
					}
				}
			}

			return this.super('handleRemove', [section_id, ev]);
		};

		o = s.option(form.ListValue, 'g_type', _('Group Type'), _('The type of the group.'));
		o.value('1', _('Domain Group'));
		o.value('2', _('MAC Group'));
		o.value('3', _('Wildcard Domain Group'));
		o.defaultValue = '1';

		o = s.option(form.DynamicList, 'domain_name', _('Domain Name'), _('The domain name of the group.'));
		o.depends('g_type', '1');
		o.datatype = 'hostname';
		o.rmempty = false;
		o.optional = false;
		o.placeholder = 'www.example.com';
		o.modalonly = true;

		o = s.option(form.DynamicList, 'mac_address', _('MAC Address'), _('The MAC address of the group.'));
		o.depends('g_type', '2');
		o.datatype = 'macaddr';
		o.rmempty = false;
		o.optional = false;
		o.placeholder = 'A0:B1:C2:D3:44:55';
		o.modalonly = true;

		o = s.option(form.DynamicList, 'wildcard_domain', _('Wildcard Domain'), _('The wildcard domain of the group.'));
		o.depends('g_type', '3');
		o.datatype = 'wildcard';
		o.rmempty = false;
		o.optional = false;
		o.placeholder = '.example.com';
		o.modalonly = true;

		o = s.option(form.Value, 'g_desc', _('Group Description'), _('The description of the group.'));
		o.datatype = 'string';
		o.optional = true;


		return m.render();
	}
});
