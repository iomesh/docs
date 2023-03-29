---
id: introduction
title: Introduction 
sidebar_label: Introduction
---

## What is IOMesh?

IOMesh is a Kubernetes-native storage system that manages storage resources within a Kuberneres cluster and automates related operations and maintenance, and provides various types of persistent storage, data protection and migration capabilities for data applications such as MySQL, Cassandra, MongoDB and middleware running on Kubernetes. 加一个社区版和商业版介绍

## Key Features 


### Kubernetes Native
IOMesh 完全基于 Kubernetes 自身能力构建，通过声明式 API（Declarative API）实现了“存储即代码（Storage as Code）”，这让开发者能够灵活地配置和进行上线，

为开发者带来最大的配置和上线的灵活性，能够通过代码管控基础设施和部署环境的变更，更好地支持 DevOps。


### High Performance 

IOMesh 可以在容器环境中支撑数据库等 I/O 密集型应用高效运行。融合部署时，I/O 本地化可为计算端提供高带宽，低延迟的存储服务。支持全闪存储环境，满足企业对于高性能环境的需求；混闪场景下支持冷热数据自动分层，冷数据自动下沉至 HDD，热数据留在缓存层，充分发挥 SSD 的硬件优势。
Databases leveraging IOMesh block storage have been tested to have lower read/write latency and higher QPS/TPS, ensuring stable operation of data services.

### No Kernel Dependencies 
   
Running separately in user space instead of kernel space, IOMesh is isolated from other applications on the same node, which means that when IOMesh fails, other applications can deliver services as usual without causing the entire system to fail. Since IOMesh is kernel independent, you do not need to install any kernel modules or worry about kernel version compatibility issues.

### Data Protection & Security

The IOMesh cluster protects data through the multi-copy mechanism among nodes. In case of failure, concurrent data recovery by multiple nodes can always ensure data redundancy as expected; PV-level snapshot capability can quickly restore data to the state at the time of snapshot. At the same time, the system can automatically detect and isolate abnormal hard disks to reduce the impact on system performance and reduce the burden of operation and maintenance work. Support the creation of PV with authentication function, users must provide the correct credentials to access the relevant PV, ensuring data security.

IOMesh 集群节点间通过多副本机制进行数据保护，故障时，多节点并发的数据恢复能够时刻确保数据冗余度符合预期；PV 级的快照能力可将数据快速恢复至快照时的状态。同时，系统能够自动检测并隔离异常硬盘，降低对系统性能的影响，并减轻运维工作负担。
支持创建带鉴权功能的 PV，用户必须提供正确的凭证才能访问相关 PV，保证了数据的安全性。

### Fully Integrated into Kubernetes Ecosystem

Provisioning storage through CSI, IOMesh supports cross-node or cross-cluster migration of stateful applications. It is seamlessly integrated with Kubernetes-related tool chains, provides a simple and efficient installation and deployment experience using Helm Chart; it supports interfaces with Prometheus and Grafana, standardizing processes related to monitoring and alerting and data visualization.


## Architecture

![IOMesh arch](https://user-images.githubusercontent.com/78140947/122766241-e2352c00-d2d3-11eb-9630-bb5b428c3178.png)
