import { LoadingOutlined } from '@ant-design/icons';
import { Form, message, Space } from 'antd';
import React from 'react';
import { useRequest } from 'umi';
import { queryCity, queryCurrent, queryProvince } from '../service';

import {
  LForm,
  LFormItemInput,
  LFormItemSelect,
  LFormItemTextArea,
  LFormItemUpload,
} from 'lighting-design';
import styles from './BaseView.less';

const BaseView: React.FC = () => {
  const { data: currentUser, loading } = useRequest(() => {
    return queryCurrent();
  });

  const [form] = LForm.useForm();
  const handleFinish = async (e: any) => {
    message.success('更新基本信息成功');
  };

  const sleep = (time = 1000) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('');
      }, time);
    });
  };

  return (
    <div className={styles.baseView}>
      {loading ? null : (
        <>
          <div className={styles.left}>
            <LForm
              labelWidth={90}
              form={form}
              layout="horizontal"
              onFinish={handleFinish}
              submitter={{
                showReset: false,
                submitText: '更新基本信息',
              }}
              initialValues={{
                ...currentUser,
                phone1: currentUser?.phone.split('-')[0],
                phone: currentUser?.phone.split('-')[1],
                province: currentUser?.geographic.province.key,
                city: currentUser?.geographic.city.key,
                avatar: [
                  {
                    url: currentUser?.avatar,
                    thumbUrl: currentUser?.avatar,
                  },
                ],
              }}
            >
              <Form.Item label="头像" style={{ marginBottom: 0 }}>
                <LFormItemUpload
                  isCrop
                  onUpload={async (file) => {
                    await sleep();
                    return {
                      url: file,
                    };
                  }}
                  uploadType="avatar"
                  name="avatar"
                  uploadProps={{
                    name: 'fileName',
                  }}
                  buttonText="上传头像"
                />
              </Form.Item>
              <LFormItemInput name="name" required label="昵称" />
              <LFormItemInput name="email" required label="邮箱" tooltip="qq邮箱" />
              <LFormItemInput name="address" required label="街道地址" />
              <Form.Item label="手机号码" required style={{ marginBottom: 0 }}>
                <Space>
                  <LFormItemSelect
                    name="phone1"
                    options={[
                      {
                        label: '+086',
                        value: '+086',
                      },
                    ]}
                    selectProps={{
                      allowClear: false,
                    }}
                  />
                  <LFormItemInput
                    type="phone"
                    name="phone"
                    placeholder="请输入联系电话"
                    required
                    style={{
                      width: 328,
                    }}
                  />
                </Space>
              </Form.Item>
              <Form.Item label="所在省市" required style={{ marginBottom: 0 }}>
                <Space>
                  <LFormItemSelect
                    style={{ width: 200 }}
                    name="province"
                    request={async () => {
                      return queryProvince().then(({ data }) => {
                        return data.map((item) => {
                          return {
                            label: item.name,
                            value: item.id,
                          };
                        });
                      });
                    }}
                    placeholder="请选择省市"
                    selectProps={{
                      onChange() {
                        form.setFieldValue('city', undefined);
                      },
                    }}
                  />
                  <LFormItemSelect
                    name="city"
                    placeholder="请选择地区"
                    style={{ width: 200 }}
                    spin={{
                      indicator: <LoadingOutlined />,
                    }}
                    dependencies={['province']}
                    request={async (province) => {
                      if (!province) return [];
                      return queryCity(province).then(({ data }) => {
                        return data.map((item) => {
                          return {
                            label: item.name,
                            value: item.id,
                          };
                        });
                      });
                    }}
                  />
                </Space>
              </Form.Item>
              <LFormItemTextArea
                name="profile"
                label="个人简介"
                textAreaProps={{
                  rows: 4,
                }}
              />
            </LForm>
          </div>
        </>
      )}
    </div>
  );
};

export default BaseView;
