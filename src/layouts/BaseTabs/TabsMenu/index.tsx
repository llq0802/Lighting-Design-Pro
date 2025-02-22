import { FullscreenOutlined, HomeOutlined, ReloadOutlined, TagOutlined } from '@ant-design/icons';
import Icon from '@ant-design/icons';
import * as antIcons from '@ant-design/icons';
import { useKeyPress } from 'ahooks';
import _ from 'lodash';
import type { TabsProps } from 'antd';
import { Button, Tooltip } from 'antd';
import { Dropdown, Space, Tabs } from 'antd';
import type { CSSProperties } from 'react';
import React, { useCallback, useContext, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { history, matchPath, useModel } from 'umi';
import type { DraggableTabPaneProps, TabsMenuProps, TagsItemType } from './data';
import styles from './index.less';
import { IconFont } from '@/components/system/IconModal';
import { BaseTabsContext } from '..';
import { NOT_PATH, TABS_LIST } from '@/constants';
import NotPage from '@/pages/404';

const type = 'DraggableTabNode';

const TabIconStyle: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
  transition: 'width .2s',
  overflow: 'hidden',
};

const TabBarStyle: CSSProperties = {
  position: 'fixed',
  zIndex: 1,
  padding: 0,
  width: '100%',
  background: 'white',
};

const DraggableTabNode = ({ index, children, moveNode }: DraggableTabPaneProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    collect: (monitor) => {
      const { index: dragIndex } = monitor.getItem() || {};
      if (dragIndex === index) return {};
      return {
        isOver: monitor.isOver(),
        dropClassName: 'dropping',
      };
    },
    drop: (item: { index: React.Key }) => moveNode(item.index, index),
  });
  const [{ isDragging }, drag] = useDrag({
    type,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <div ref={ref} style={{ opacity: isDragging ? 0 : 1 }} className={isOver ? dropClassName : ''}>
      {children}
    </div>
  );
};

// 定义全屏路由
const FULL_PATH = ['/dataScreen'];

const TabsMenu: React.FC<TabsMenuProps> = ({
  cacheKeyMap,
  tabList,
  closePage,
  closeAllPage,
  closeOtherPage,
  refreshPage,
}) => {
  const { initialState } = useModel('@@initialState');
  const { handleRefreshPage } = useContext(BaseTabsContext);
  const fullRef = useRef(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFull, setIsFull] = useState<boolean>(false);
  useKeyPress('esc', () => {
    setIsFull(false);
  });

  const DraggableTabs: React.FC<TabsProps> = useCallback(
    (props: JSX.IntrinsicAttributes & TabsProps) => {
      const { items = [] } = props;
      const [order, setOrder] = useState<React.Key[]>([]);
      const moveTabNode = (dragKey: React.Key, hoverKey: React.Key) => {
        const newOrder = order.slice();
        items.forEach((item) => {
          if (item.key && newOrder.indexOf(item.key) === -1) {
            newOrder.push(item.key);
          }
        });
        const dragIndex = newOrder.indexOf(dragKey); // 移动的标签位置
        const hoverIndex = newOrder.indexOf(hoverKey); // 移动后标签位置
        newOrder.splice(dragIndex, 1); // 删除移动前标签
        newOrder.splice(hoverIndex, 0, dragKey); // 添加移动后标签
        setOrder(newOrder);
      };

      const renderTabBar: TabsProps['renderTabBar'] = (tabBarProps, DefaultTabBar: any) => {
        return (
          <DefaultTabBar {...tabBarProps}>
            {(node: any) => (
              <DraggableTabNode key={node.key} index={node.key!} moveNode={moveTabNode}>
                {node}
              </DraggableTabNode>
            )}
          </DefaultTabBar>
        );
      };
      const orderItems = [...items].sort((a, b) => {
        const orderA = order.indexOf(a.key!);
        const orderB = order.indexOf(b.key!);
        if (orderA !== -1 && orderB !== -1) return orderA - orderB;
        if (orderA !== -1) return -1;
        if (orderB !== -1) return 1;
        const ia = items.indexOf(a);
        const ib = items.indexOf(b);
        return ia - ib;
      });
      return (
        <DndProvider backend={HTML5Backend}>
          <Tabs renderTabBar={renderTabBar} {...props} items={orderItems} />
        </DndProvider>
      );
    },
    [],
  );

  return (
    <div
      className={`${styles.tags_wrapper} ${isFull ? styles.tabs_full : ''}`}
      ref={fullRef}
      style={{ background: isFull ? '#ffffff' : 'unset' }}
    >
      <DraggableTabs
        hideAdd
        tabBarExtraContent={{
          right: (
            <Space style={{ marginRight: 24, display: 'flex', alignItems: 'center' }}>
              <Tooltip title="重新加载" placement="bottom">
                <Button type="text" style={{ display: 'flex', alignItems: 'center' }}>
                  <ReloadOutlined
                    spin={loading}
                    onClick={() => {
                      if (!loading) {
                        setLoading(true);
                        handleRefreshPage();
                        setTimeout(() => setLoading(false), 1000);
                      }
                    }}
                    style={{ fontSize: 18, fontWeight: 800, cursor: 'pointer' }}
                  />
                </Button>
              </Tooltip>
            </Space>
          ),
        }}
        onEdit={(targetKey, action) => {
          if (action === 'remove') {
            const tabItem = tabList.find(
              (item) => item.path === (targetKey as string).split(':')[0],
            );
            if (tabItem) closePage(tabItem);
          }
        }}
        style={{ height: 42 }}
        onChange={(key: string) => {
          const tabItem = (
            JSON.parse(sessionStorage.getItem(TABS_LIST) || '[]') as TagsItemType[]
          ).find((o) => o.path === key);
          if (tabItem) {
            const search = (tabItem?.location?.search as Location) || '';
            history.push(`${key}${search}`);
          } else {
            history.push(key);
          }
        }}
        items={tabList.map((item): any => {
          return {
            label: (
              <Dropdown
                menu={{
                  items: [
                    {
                      label: (
                        <Space align="center">
                          <ReloadOutlined style={{ fontSize: 12 }} />
                          <div>刷新</div>
                          <div
                            className={styles.drop_down_span}
                            onClick={() => refreshPage && refreshPage(item)}
                          />
                        </Space>
                      ),
                      key: '1',
                    },
                    {
                      label: (
                        <Space align="center">
                          <TagOutlined style={{ fontSize: 12 }} />
                          <div>关闭其他</div>
                          <div
                            className={styles.drop_down_span}
                            onClick={() => closeOtherPage && closeOtherPage()}
                          />
                        </Space>
                      ),
                      key: '2',
                    },
                    {
                      label: (
                        <Space align="center">
                          <HomeOutlined style={{ fontSize: 12 }} />
                          <div>关闭所有</div>
                          <div className={styles.drop_down_span} onClick={closeAllPage} />
                        </Space>
                      ),
                      key: '3',
                    },
                    {
                      label: (
                        <Space align="center">
                          <FullscreenOutlined style={{ fontSize: 12 }} />
                          <div>全屏</div>
                          <div className={styles.drop_down_span} onClick={() => setIsFull(true)} />
                        </Space>
                      ),
                      key: '4',
                    },
                  ],
                }}
                trigger={['contextMenu']}
              >
                <div>
                  {initialState?.settings?.tabView && initialState?.settings?.tabView?.tabIcon && (
                    <div style={{ ...TabIconStyle, width: item.active && item.icon ? 20 : 0 }}>
                      {typeof item.icon === 'string' && item.icon.includes('icon') ? (
                        <IconFont type={item.icon} />
                      ) : typeof item.icon === 'string' ? (
                        <Icon component={antIcons[item.icon]} />
                      ) : (
                        item.icon
                      )}
                    </div>
                  )}
                  {item.title}
                  <div className={styles.drop_down_span} />
                </div>
              </Dropdown>
            ),
            key: item.path,
          };
        })}
        renderTabBar={(props, DefaultTabBar: any) => {
          if (FULL_PATH.includes(props.activeKey))
            return <DefaultTabBar {...props} style={{ marginBottom: 0 }} />;
          return (
            <div style={TabBarStyle}>
              <DefaultTabBar {...props} style={{ marginBottom: 0 }} />
            </div>
          );
        }}
        activeKey={location.pathname}
        size="small"
        type="editable-card"
      />

      {tabList.map((item) => (
        <div
          className="keep-alive-layout"
          key={`${item.path}:${cacheKeyMap[`${item.path}`] || '_'}`}
          hidden={!matchPath(location.pathname, item.path as string)}
        >
          <div
            className={item.active ? `animate__animated animate__fadeIn` : ''}
            style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              overflow: 'hidden auto',
              padding: '24px',
            }}
          >
            {item.path === NOT_PATH ? <NotPage /> : item.children}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TabsMenu;
