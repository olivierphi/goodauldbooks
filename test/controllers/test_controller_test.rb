require 'test_helper'

class TestControllerTest < ActionDispatch::IntegrationTest
  test "should get hello" do
    get test_hello_url
    assert_response :success
  end

end
