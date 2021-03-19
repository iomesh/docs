---
id: introduction
title: Introduction
sidebar_label: Introduction
---

## What is IOMesh？

IOMesh is a distributed storage system specially designed for Kubernetes workloads, providing reliable persistent storage capabilities for containerized stateful applications such as MySQL, Cassandra, and MongoDB.

- Thousands of Pods created and destroyed every minites in kubernetes clusters. IOMesh is built for such highly dynamic and large-scale workloads in the cloud-native era. The design of IOMesh keeps this in mind and aims to provide the performance, reliability, and scalability required by cloud-native applications.
- IOMesh runs natively on Kubernetes and was completely developed utilizing Kubernetes's capabilities. Because of this, operations teams can leverage the standard Kubernetes APIs for unified management of both applications and IOMesh storage system, which integrates perfectly with existing DevOps processes.
- IOMesh allows users to start at small scale and expand the storage at will by adding disks or nodes.

## Key Features

1. High Performance
   For databases, performance is one of the key determinations. IOMesh has shown excellent performance in standard benchmark tests for Kubernetes. The Read/Write Latency is stable. This means that it can provide more stable and efficient data services.
2. No Kernel Dependencies
   IOMesh runs entirely in the userspace. It can provide more reliable service with efficient software fault isolation. When something wrong happens, the rest applications running on the same node can continue to run instead of causing the entire system to crash. Meanwhile, it simplifies the deployment and maintenance. There is no need to install any kernel module during deployment, and no need to consider kernel version compatibility in the future.
3. Storage Performance Tiering
   IOMesh supports flexible deployment of hybrid disks including NVMe SSD, SATA SSD, HDD. This can help users make the most of their storage investment, maximizing the storage performance while controlling costs to a certain extent.

## Architecture

![img](https://lh3.googleusercontent.com/4Yssin2b7eH5xylvgJ5Do0khj8Dlfv_cG8F-sHrJ7ztah5ixKleRvL_uX_b8maQ1w72lPoallwviBzvCMVgQUFrV6y2yFWNmXk4wQNAMNfaLMMeRQ9cIWznvF-gZeOeP4SnGUOsF)

## Compatibility List with Kubernetes

| IOMesh Version | Kubernetes Version |
| -------------- | ------------------ |
| v0.1.0         | v1.17 or higher    |
