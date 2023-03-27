---
id: introduction
title: Introduction 
sidebar_label: Introduction
---

## What is IOMesh?

IOMesh is a Kubernetes-native storage system that manages storage resources within a Kubernetes cluster, automates operations and maintenance, and provides various types of persistent storage, data protection and migration capabilities for data applications such as MySQL, Cassandra, MongoDB and middleware running on Kubernetes.

## Key Features 


### Kubernetes Native
Built entirely on the capabilities of Kubernetes, IOMesh implements Storage as Code through declarative API, allowing DevOps to manage infrastructure and deployment environment more flexibly.

### High Performance 

IOMesh enables I/O-intensive databases and applications to run efficiently in the container environment. Leveraging I/O localization and tiered storage, IOMesh achieves high IOPS in kubernetes storage performance tests while maintaining extremely low latency, ensuring stable adoption of data applications.

### No Kernel Dependencies 
   
Running separately in user space instead of kernel space, IOMesh is isolated from other applications on the same node, which means that when IOMesh fails, other applications can deliver services as usual without causing the entire system to fail. Since IOMesh is kernel independent, you do not need to install any kernel modules or worry about kernel version compatibility issues.

### Data Protection & Security

The IOMesh cluster protects data through the multi-copy mechanism among nodes. In case of failure, concurrent data recovery by multiple nodes can always ensure data redundancy as expected; PV-level snapshot capability can quickly restore data to the state at the time of snapshot. At the same time, the system can automatically detect and isolate abnormal hard disks to reduce the impact on system performance and reduce the burden of operation and maintenance work. Support the creation of PV with authentication function, users must provide the correct credentials to access the relevant PV, ensuring data security.

IOMesh 集群节点间通过多副本机制进行数据保护，故障时，多节点并发的数据恢复能够时刻确保数据冗余度符合预期；PV 级的快照能力可将数据快速恢复至快照时的状态。同时，系统能够自动检测并隔离异常硬盘，降低对系统性能的影响，并减轻运维工作负担。
支持创建带鉴权功能的 PV，用户必须提供正确的凭证才能访问相关 PV，保证了数据的安全性。

### Fully Integrated into Kubernetes Ecosystem

Provisioning storage through CSI, IOMesh supports migration of stateful applications across nodes or clusters. It is seamlessly integrated with Kubernetes tool chains, using Helm Chart to provide simple deployment and supports monitoring IOMesh storage with Prometheus and Grafana


cross-node or cross-cluster migration of stateful applications. It is seamlessly integrated with Kubernetes-related tool chains, provides a simple and efficient installation and deployment experience using Helm Chart; it supports interfaces with Prometheus and Grafana, standardizing processes related to monitoring and alerting and data visualization.


## Architecture

![IOMesh arch](https://user-images.githubusercontent.com/78140947/122766241-e2352c00-d2d3-11eb-9630-bb5b428c3178.png)
