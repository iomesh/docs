---
id: localpv-manager
title: IOMesh LocalPV Manager
sidebar_label: IOMesh LocalPV Manager
---

## Introduction

### What is IOMesh LocalPV Manager

IOMesh LocalPV Manager 是一个用于管理 K8s Worker 节点本地存储的 csi-driver，用户可以基于节点上的一个目录或一块磁盘创建 Kubernetes Persistent Volumes（后续简称为 IOMesh LocalPV） 提供给 Pod 使用

一些有状态应用如 分布式对象存储(Minio)/分布式数据库(TiDB) 等，能够在应用层保证数据的高可用，如果在多副本的 IOMesh PV 上运行它们会在数据路径中增加一层复制（目前 IOMesh 不支持单副本），这会导致一定程度的性能下降和空间浪费，因此这种场景下更适合使用 IOMesh LocalPV

相比于 Kubernetes HostPath Volume 和 Kubernetes 原生的 local PV，IOMesh LocalPV 有如下优势：

- Kubernetes 的原始功能只支持静态配置（statically provisioned），IOMesh LocalPV 支持动态配置（dynamic provisioned），这意味着用户可以使用StorageClass、PVC 和 PV 灵活的访问节点本地存储，且不需要管理员预先创建静态 PV

- Kubernetes 的原始功能只支持使用节点上的目录，IOMesh LocalPV 支持使用目录或块设备

- 当使用节点上的目录作为后端存储时，IOMesh LocalPV 支持 PV 级别的容量限额

- IOMesh LocalPV Manager 使用独立的调度器，能够确保 Pod 不会因为本地存储资源不足而调度失败，并且尽可能让整个集群的本地存储容量均衡.

### Architecture

![IOMesh LocalPV Manager](https://user-images.githubusercontent.com/12667277/217775597-7261e106-1407-4adf-92df-a1c99e447273.svg)

IOMesh LocalPV Manager 主要由三个组件构成

- Controller Driver
标准的 CSI Controller Server 实现，与 kube-apiserver 交互。负责 LocalPV 的创建和删除，以及 PV 与本地目录或设备的关系映射，每个 K8s Worker 节点都会有一个 Controller Driver 实例

- Node Driver
标准的 CSI Node Server 实现，与 kubelet 交互。负责 LocalPV 的挂载与格式化，每个 K8s Worker 节点都会有一个 Node Driver 实例

- Node Disk Manager
用于发现节点块设备，并将块设备抽象成 BlockDevice 对象，提供 BlockDeviceClaim 机制确保某一个块设备被某一个 Pod 独占.

## Deployment 
