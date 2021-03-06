/////////////////////////////////////////////////////////////
//
// pgAdmin 4 - PostgreSQL Tools
//
// Copyright (C) 2013 - 2021, The pgAdmin Development Team
// This software is released under the PostgreSQL Licence
//
//////////////////////////////////////////////////////////////
import RowSecurityPolicySchema from './row_security_policy.ui';
import { getNodeListByName } from '../../../../../../../../static/js/node_ajax';


define('pgadmin.node.row_security_policy', [
  'sources/gettext', 'sources/url_for', 'jquery', 'underscore',
  'sources/pgadmin', 'pgadmin.browser',
  'pgadmin.backform', 'pgadmin.alertifyjs',
  'pgadmin.node.schema.dir/schema_child_tree_node',
  'pgadmin.browser.collection',
], function(
  gettext, url_for, $, _, pgAdmin, pgBrowser, Backform, alertify,
  SchemaChildTreeNode
) {

  if (!pgBrowser.Nodes['coll-row_security_policy']) {
    pgAdmin.Browser.Nodes['coll-row_security_policy'] =
      pgAdmin.Browser.Collection.extend({
        node: 'row_security_policy',
        label: gettext('RLS Policies'),
        type: 'coll-row_security_policy',
        columns: ['name', 'description'],
        canDrop: SchemaChildTreeNode.isTreeItemOfChildOfSchema,
        canDropCascade: SchemaChildTreeNode.isTreeItemOfChildOfSchema,
      });
  }

  if (!pgBrowser.Nodes['row_security_policy']) {
    pgAdmin.Browser.Nodes['row_security_policy'] = pgBrowser.Node.extend({
      parent_type: ['table', 'view', 'partition'],
      collection_type: ['coll-table', 'coll-view'],
      type: 'row_security_policy',
      label: gettext('RLS Policy'),
      hasSQL:  true,
      hasDepends: true,
      width: pgBrowser.stdW.sm + 'px',
      sqlAlterHelp: 'sql-alterpolicy.html',
      sqlCreateHelp: 'sql-createpolicy.html',
      dialogHelp: url_for('help.static', {'filename': 'rls_policy_dialog.html'}),
      url_jump_after_node: 'schema',
      Init: function() {
        /* Avoid mulitple registration of menus */
        if (this.initialized)
          return;

        this.initialized = true;

        pgBrowser.add_menus([{
          name: 'create_row_security_policy_on_coll', node: 'coll-row_security_policy', module: this,
          applies: ['object', 'context'], callback: 'show_obj_properties',
          category: 'create', priority: 1, label: gettext('RLS Policy...'),
          icon: 'wcTabIcon icon-row_security_policy', data: {action: 'create', check: true},
          enable: 'canCreate',
        },{
          name: 'create_row_security_policy', node: 'row_security_policy', module: this,
          applies: ['object', 'context'], callback: 'show_obj_properties',
          category: 'create', priority: 1, label: gettext('RLS Policy...'),
          icon: 'wcTabIcon icon-row_security_policy', data: {action: 'create', check: true},
          enable: 'canCreate',
        },
        {
          name: 'create_row_security_policy_on_coll', node: 'table', module: this,
          applies: ['object', 'context'], callback: 'show_obj_properties',
          category: 'create', priority: 6, label: gettext('RLS Policy...'),
          icon: 'wcTabIcon icon-row_security_policy', data: {action: 'create', check: true},
          enable: 'canCreate',
        },
        ]);
      },
      canDrop: SchemaChildTreeNode.isTreeItemOfChildOfSchema,
      canDropCascade: SchemaChildTreeNode.isTreeItemOfChildOfSchema,
      getSchema: function(treeNodeInfo, itemNodeData) {
        return new RowSecurityPolicySchema(
          {
            role: ()=>getNodeListByName('role', treeNodeInfo, itemNodeData, {}, ()=>true, (res)=>{
              res.unshift({label: 'PUBLIC', value: 'public'});
              return res;
            }),
            nodeInfo: treeNodeInfo
          }
        );
      },
      model: pgAdmin.Browser.Node.Model.extend({
        idAttribute: 'oid',
        defaults: {
          name: undefined,
        },
        schema: [{
          id: 'name', label: gettext('Name'), cell: 'string',
          type: 'text', readonly: true, cellHeaderClasses: 'width_percent_50',
          mode: ['properties']
        },{
          id: 'oid', label: gettext('OID'), cell: 'string',
          editable: false, type: 'text', mode: ['properties'],
        }],
        validate: function(keys) {
          var msg;
          this.errorModel.clear();
          // If nothing to validate
          if (keys && keys.length == 0) {
            return null;
          }

          if(_.isUndefined(this.get('name'))
            || String(this.get('name')).replace(/^\s+|\s+$/g, '') == '') {
            msg = gettext('Name cannot be empty.');
            this.errorModel.set('name', msg);
            return msg;
          }
          if (!this.isNew() && !_.isNull(this.get('using_orig')) && this.get('using_orig') != '' && String(this.get('using')).replace(/^\s+|\s+$/g, '') == ''){
            msg = gettext('"USING" can not be empty once the value is set');
            this.errorModel.set('using', msg);
            return msg;
          }
          if (!this.isNew() && !_.isNull(this.get('withcheck_orig')) && this.get('withcheck_orig') != '' && String(this.get('withcheck')).replace(/^\s+|\s+$/g, '') == ''){
            msg = gettext('"Withcheck" can not be empty once the value is set');
            this.errorModel.set('withcheck', msg);
            return msg;
          }
          return null;
        },
        disableWithCheck: function(m){
          var event = m.get('event');
          if ((event == 'SELECT') || (event == 'DELETE')){
            m.set('withcheck', '');
            return true;
          }
          return false;
        },

        disableUsing: function(m){
          var event = m.get('event');

          if (event == 'INSERT'){
            return true;
          }
          return false;
        },

      }),
      canCreate: function(itemData, item) {

        var treeData = pgBrowser.tree.getTreeNodeHierarchy(item),
          server = treeData['server'];

        // If node is under catalog then do not allow 'create' menu
        if (treeData['catalog'] != undefined)
          return false;

        // If server is less than 9.5 then do not allow 'create' menu
        if (server && server.version < 90500)
          return false;

        // by default we want to allow create menu
        return true;
      },
    });
  }

  return pgBrowser.Nodes['row_security_policy'];
});
