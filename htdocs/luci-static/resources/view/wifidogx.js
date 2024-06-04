'use strict';
'require view';
'require ui';
'require form';
'require rpc';
'require uci';
'require fs'
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
		var m, s, o;

		m = new form.Map('wifidogx', _('ApFree-WiFiDog'));
		m.description = github.desc('apfree-wifidog offers a stable and secure captive portal solution.', 'liudf0716', 'apfree-wifidog');
		

		s = m.section(form.NamedSection, 'common',  _('Configuration'));
		s.addremove = false;
		s.anonymous = true;
		s.tab('basic', _('Basic Settings'));
		s.tab('advanced', _('Advanced Settings'));
		s.tab('status', _('Status'));

		o = s.taboption('basic', form.Flag, 'enabled', _('Enable'), _('Enable apfree-wifidog service.'));
		o.rmempty = false;

		o = s.taboption('basic', form.Value, 'gateway_id', _('Gateway ID'), _('The ID of the gateway.'));
		o.rmempty = false;
		o.datatype = 'string';
		o.optional = false;

		o = s.taboption('basic', form.Value, 'channel_path', _('Channel Path'), _('The channel path of the gateway.'));
		o.datatype = 'string';
		o.rmempty = false;
		o.optional = false;

		o = s.taboption('basic', form.Value, 'auth_server_hostname', _('Auth Server Hostname'), 
						_('The domain or IP address of the authentication server.'));
		o.rmempty = false;
		o.datatype = 'or(host,ip4addr)';
		o.optional = false;

		o = s.taboption('basic', form.Value, 'auth_server_port', _('Auth Server Port'),
						_('The port of the authentication server.'));
		o.rmempty = false;
		o.datatype = 'port';
		o.optional = false;

		o = s.taboption('basic', form.Value, 'auth_server_path', _('Auth Server URI path'),
						_('The URI path of the authentication server.'));
		o.rmempty = false;
		o.datatype = 'string';
		o.optional = false;

		o = s.taboption('advanced', form.DynamicList, 'trusted_domains', _('Trusted Domains'),
						_('The trusted domains of the gateway'));
		o.rmempty = true;
		o.optional = true;
		o.datatype = 'hostname';
		o.placeholder = 'www.example.com';

		o = s.taboption('advanced', form.DynamicList, 'trusted_macs', _('Trusted MACs'),
						_('The trusted MAC addresses of the gateway'));
		o.rmempty = true;
		o.optional = true;
		o.datatype = 'macaddr';
		o.placeholder = 'A0:B1:C2:D3:44:55';
		
		
		o = s.taboption('status', form.DummyValue, '_status');
		o.rawhtml = true;
		o.cfgvalue = function() {
			return getServiceStatus().then(function (isRunning) {
				return renderStatus(isRunning);
			});
		};

	
		// add poll to update the status
		pollData:L.Poll.add(function() {
			return L.resolveDefault(getServiceStatus()).then(function(isRunning) {
				var table = document.getElementById('wifidogx-status');
				if (isRunning) {
					return fs.exec('/etc/init.d/wifidogx', ['status']).then(function (res) {
						if (res.code === 0) {
							var lines = res.stdout.split('\n');
							var status = {};
							lines.forEach(function(line) {
								if (line.startsWith('Version:')) {
									status.version = line.split(':')[1].trim();
								} else if (line.startsWith('Uptime:')) {
									status.uptime = line.split(':')[1].trim();
								} else if (line.startsWith('Internet Connectivity:')) {
									status.internetConnectivity = line.split(':')[1].trim() === 'yes';
								} else if (line.startsWith('Auth server reachable:')) {
									status.authServerReachable = line.split(':')[1].trim() === 'yes';
								} else if (line.startsWith('Authentication servers:')) {
									status.authServers = [];
									var serverLines = lines.slice(lines.indexOf(line) + 1);
									serverLines.forEach(function(serverLine) {
										if (serverLine.startsWith('  Host:')) {
											status.authServers.push(serverLine.split(':')[1].trim());
										}
									});
								}
							});
							
							var trows = [];
							trows.push([_('Version'), status.version]);
							trows.push([_('Uptime'), status.uptime]);
							trows.push([_('Internet Connectivity'), status.internetConnectivity ? 'Yes' : 'No']);
							trows.push([_('Auth server reachable'), status.authServerReachable ? 'Yes' : 'No']);
							trows.push([_('Authentication servers'), status.authServers.join('<br>')]);

							cbi_update_table(table, trows, E('em', _('No information available')));
						}	
					});
				} else {
					cbi_update_table(table, [], E('em', _('No information available')));
				}
			});
		}, 2);

		o = s.taboption('status', form.DummyValue, 'detail');
		o.rawhtml = true;
		o.render = function() {
			// add table to show the detail status of wifidogx
			var table = E('table', { 'class': 'table' , 'id': 'wifidogx-status'}, [
				E('tr', { 'class': 'tr table-titles' }, [
					E('th', { 'class': 'th' }, _('Information')),
					E('th', { 'class': 'th' }, _('Value')),
				])
			]);

			cbi_update_table(table, [], E('em', { 'class': 'spinning' }, _('Collecting data...')))

			// get wifidogx version
			return E('div', {'class': 'cbi-section cbi-tblsection'}, [
				E('h3', _('Status')), table]);
		};
		this.pollData;
		
		return m.render();
	}
});
