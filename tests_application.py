import unittest
from application import channelsClass

class TestChannelsClass(unittest.TestCase):

    def setUp(self):
        self.channels = channelsClass()

    def test_add(self):
        self.channels.add('channel1')
        self.assertTrue(self.channels.exists('channel1'))

    def test_delete(self):
        self.channels.add('channel2')
        self.channels.delete('channel2')
        self.assertFalse(self.channels.exists('channel2'))

    def test_exists(self):
        self.channels.add('channel3')
        self.assertTrue(self.channels.exists('channel3'))
        self.assertFalse(self.channels.exists('channel4'))

    def test_toList(self):
        self.channels.add('channel5')
        self.channels.add('channel6')
        self.assertEqual(self.channels.toList(), ['channel5', 'channel6'])

    def test_addPost(self):
        self.channels.add('channel7')
        self.channels.addPost('channel7', 'user1', 'Hello, world!')
        self.assertEqual(self.channels.postsListSize('channel7'), 1)

    def test_postsList(self):
        self.channels.add('channel8')
        self.channels.addPost('channel8', 'user2', 'Hello, world!')
        self.assertEqual(len(self.channels.postsList('channel8')), 1)

    def test_postsListSize(self):
        self.channels.add('channel9')
        self.channels.addPost('channel9', 'user3', 'Hello, world!')
        self.assertEqual(self.channels.postsListSize('channel9'), 1)

if __name__ == '__main__':
    unittest.main()
