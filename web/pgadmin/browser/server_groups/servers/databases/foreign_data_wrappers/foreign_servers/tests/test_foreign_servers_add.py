##########################################################################
#
# pgAdmin 4 - PostgreSQL Tools
#
# Copyright (C) 2013 - 2021, The pgAdmin Development Team
# This software is released under the PostgreSQL Licence
#
##########################################################################


import json
import uuid

from pgadmin.browser.server_groups.servers.databases.extensions.tests import \
    utils as extension_utils
from pgadmin.browser.server_groups.servers.databases.foreign_data_wrappers.\
    tests import utils as fdw_utils
from pgadmin.browser.server_groups.servers.databases.tests import \
    utils as database_utils
from pgadmin.utils.route import BaseTestGenerator
from regression import parent_node_dict
from regression.python_test_utils import test_utils as utils
from . import utils as fsrv_utils
from unittest.mock import patch


class ForeignServerAddTestCase(BaseTestGenerator):
    """
    This class will add foreign server under database node.
    """
    scenarios = utils.generate_scenarios('foreign_server_create',
                                         fsrv_utils.test_cases)

    def setUp(self):
        """ This function will create extension and foreign data wrapper."""
        super(ForeignServerAddTestCase, self).setUp()
        self.schema_data = parent_node_dict['schema'][-1]
        self.server_id = self.schema_data['server_id']
        self.db_id = self.schema_data['db_id']
        self.db_name = parent_node_dict["database"][-1]["db_name"]
        self.schema_name = self.schema_data['schema_name']
        self.extension_name = "cube"
        self.fdw_name = "fdw_{0}".format(str(uuid.uuid4())[1:8])
        self.extension_id = extension_utils.create_extension(
            self.server, self.db_name, self.extension_name, self.schema_name)
        self.fdw_id = fdw_utils.create_fdw(self.server, self.db_name,
                                           self.fdw_name)

    def create_foreign_server(self):
        """
        This function create a foreign server and returns the created
        foreign server response
        :return: created foreign server response
        """
        return self.tester.post(
            self.url + str(utils.SERVER_GROUP) + '/' +
            str(self.server_id) + '/' + str(self.db_id) +
            '/' + str(self.fdw_id) + '/',
            data=json.dumps(self.data),
            content_type='html/json')

    def runTest(self):
        """This function will fetch foreign data wrapper present under test
         database."""
        db_con = database_utils.connect_database(self,
                                                 utils.SERVER_GROUP,
                                                 self.server_id,
                                                 self.db_id)
        if not db_con["info"] == "Database connected.":
            raise Exception("Could not connect to database.")
        fdw_response = fdw_utils.verify_fdw(self.server, self.db_name,
                                            self.fdw_name)
        if not fdw_response:
            raise Exception("Could not find FDW.")
        db_user = self.server["username"]
        self.data = fsrv_utils.get_fs_data(db_user, self.server, self.db_name)

        if self.is_positive_test:
            response = self.create_foreign_server()
        else:
            if hasattr(self, "error_fdw_id"):
                self.fdw_id = 99999
                response = self.create_foreign_server()

            if hasattr(self, "missing_parameter"):
                del self.data['name']
                response = self.create_foreign_server()

            if hasattr(self, "internal_server_error"):
                return_value_object = eval(self.mock_data["return_value"])
                with patch(self.mock_data["function_name"],
                           side_effect=[return_value_object]):
                    response = self.create_foreign_server()

            if hasattr(self, "error_in_db"):
                return_value_object = eval(self.mock_data["return_value"])
                with patch(self.mock_data["function_name"],
                           side_effect=[return_value_object]):
                    response = self.create_foreign_server()

        actual_response_code = response.status_code
        expected_response_code = self.expected_data['status_code']
        self.assertEqual(actual_response_code, expected_response_code)

    def tearDown(self):
        """This function disconnect the test database and drop added foreign
         data wrapper."""
        extension_utils.drop_extension(self.server, self.db_name,
                                       self.extension_name)
        database_utils.disconnect_database(self, self.server_id, self.db_id)