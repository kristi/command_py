import parser
import os
import unittest

class TestParser(unittest.TestCase):
    def setUp(self):
        os.chdir(os.path.dirname(__file__))
        self.simple_file = "test/simple.html"
        self.z_file = "test/z.html"
        self.test_file = "test/test.html"
        pass

    def test_simple_parse(self):
        result = parser.parse_singe(self.simple_file, tag_id="Z")
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0], "Zen of Python")
        self.assertEqual(result[1], "zlib (module)")

    def test_z_parse(self):
        result = parser.parse_singe(self.z_file, tag_id="Z")
        self.assertEqual(len(result), 17)
        self.assertEqual(result[0], "Zen of Python")
        self.assertEqual(result[1], "ZeroDivisionError (exception)")
        self.assertEqual(result[2], "expressions: exception.ZeroDivisionError")
        self.assertEqual(result[3], "string.zfill()")
        self.assertEqual(result[4], "str.zfill()")
        self.assertEqual(result[5], "2to3: zip")
        self.assertEqual(result[6], "zip() (built-in function)")
        self.assertEqual(result[7], "future_builtins.zip()")
        self.assertEqual(result[8], "zipfile.ZIP_DEFLATED")
        self.assertEqual(result[9], "zipfile.ZIP_STORED")
        self.assertEqual(result[10], "zipfile.ZipFile")
        self.assertEqual(result[11], "zipfile")
        self.assertEqual(result[12], "zipimport")
        self.assertEqual(result[13], "zipimport.zipimporter")
        self.assertEqual(result[14], "ZipImportError (exception)")
        self.assertEqual(result[15], "zipfile.ZipInfo")
        self.assertEqual(result[16], "zlib (module)")

    def test_test_parse_singe(self):
        # title    "Zen of Python"
        # exception "exception.ZeroDivisionError (exception)"
        # method    "
        pass


if __name__ == '__main__':
    unittest.main()